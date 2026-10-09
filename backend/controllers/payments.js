const stripe = require('../config/stripe');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
require('dotenv').config();

const User = require('../models/user');
const Course = require('../models/course');
const CourseProgress = require("../models/courseProgress");

const { default: mongoose } = require('mongoose');


// ================ Create Stripe Checkout Session ================
exports.capturePayment = async (req, res) => {
    try {
        // extract courseId & userId
        const { coursesId } = req.body;
        const userId = req.user.id;

        if (!coursesId || coursesId.length === 0) {
            return res.json({ success: false, message: "Please provide Course Id" });
        }

        let totalAmount = 0;
        let lineItems = [];

        for (const course_id of coursesId) {
            let course;
            try {
                // valid course Details
                course = await Course.findById(course_id);
                if (!course) {
                    return res.status(404).json({ success: false, message: "Could not find the course" });
                }

                // check user already enrolled the course
                const uid = new mongoose.Types.ObjectId(userId);
                if (course.studentsEnrolled.includes(uid)) {
                    return res.status(400).json({ success: false, message: "Student is already Enrolled" });
                }

                totalAmount += course.price;

                // Create line items for Stripe
                lineItems.push({
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: course.courseName,
                            description: course.courseDescription,
                            images: [course.thumbnail],
                        },
                        unit_amount: course.price * 100, // Stripe expects amount in smallest currency unit (paise for INR)
                    },
                    quantity: 1,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: error.message });
            }
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            client_reference_id: userId,
            metadata: {
                coursesId: JSON.stringify(coursesId),
                userId: userId
            }
        });

        // return response
        res.status(200).json({
            success: true,
            sessionId: session.id,
            sessionUrl: session.url,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Could not Initiate Payment Session" });
    }
}


// ================ Verify Stripe Payment ================
exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID not provided" });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if payment was successful
        if (session.payment_status === 'paid') {
            const coursesId = JSON.parse(session.metadata.coursesId);
            const userId = session.metadata.userId;

            // Enroll students
            await enrollStudents(coursesId, userId, res);

            return res.status(200).json({ 
                success: true, 
                message: "Payment Verified and Enrollment Successful" 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Payment not completed" 
            });
        }
    }
    catch (error) {
        console.log("Error in verifyPayment:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Payment verification failed" 
        });
    }
}


// ================ Enroll Students to course after payment ================
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({ 
            success: false, 
            message: "Please Provide data for Courses or UserId" 
        });
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $addToSet: { studentsEnrolled: userId } },
                { new: true },
            );

            if (!enrolledCourse) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Course not Found" 
                });
            }

            // Initialize course progress with 0 percent
            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            });

            // Find the student and add the course to their list of enrolled courses
            // Change this section:
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { courses: courseId }, // Changed $push to $addToSet
                    $push: { courseProgress: courseProgress._id }, // Keep this as $push since progress is unique per enrollment
                },
                { new: true }
            );

            // Send an email notification to the enrolled student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            );
            
            console.log("Email Sent Successfully", emailResponse);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }
}


// ================ Send Payment Success Email ================
exports.sendPaymentSuccessEmail = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user.id;

        if (!sessionId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all the fields" 
            });
        }

        // Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Find student
        const enrolledStudent = await User.findById(userId);
        
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName}`,
                session.amount_total / 100,
                session.id,
                session.payment_intent
            )
        );

        res.status(200).json({ 
            success: true, 
            message: "Payment success email sent" 
        });
    }
    catch (error) {
        console.log("Error in sending payment success email:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Could not send email" 
        });
    }
}


// ================ Webhook to handle Stripe events (Optional but recommended) ================
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Fulfill the purchase
        const coursesId = JSON.parse(session.metadata.coursesId);
        const userId = session.metadata.userId;

        await enrollStudents(coursesId, userId, res);
    }

    res.json({ received: true });
}

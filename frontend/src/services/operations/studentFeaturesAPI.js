import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";
const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;
// ================ buyCourse (Stripe Checkout) ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");

    try {
        // initiate the checkout session on the backend
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
            { coursesId },
            {
                Authorization: `Bearer ${token}`,
            })

        if (!orderResponse.data.success) {
            throw new Error(orderResponse.data.message);
        }

        // Backend should return Stripe Checkout URL in `sessionUrl`
        if (orderResponse.data.sessionUrl) {
            window.location.href = orderResponse.data.sessionUrl;
            return;
        }

        throw new Error("Payment provider response unexpected");
    }
    catch (error) {
        console.log("PAYMENT API ERROR.....", error);
        toast.error(error.response?.data?.message || error.message);
    }
    toast.dismiss(toastId);
}


// ================ send Payment Success Email ================
// ================ verify payment ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("payment Successful, you are addded to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}

// verify Stripe session (wrapper) - frontend can call this with the `session_id` query param
export async function verifyStripePayment(sessionId, token, navigate, dispatch) {
    return verifyPayment({ sessionId }, token, navigate, dispatch);
}
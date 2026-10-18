import { toast } from "react-hot-toast"

import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"

const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API, GET_INSTRUCTOR_DATA_API } = profileEndpoints


// ================ get User Details  ================
export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, { Authorization: `Bearer ${token}`, })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error) {
      dispatch(logout(navigate))
      console.log("GET_USER_DETAILS API ERROR............", error)
      toast.error("Could Not Get User Details")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

// ================ get User Enrolled Courses  ================
export async function getUserEnrolledCourses(token) {
  const demoFallback = [
    {
      _id: "6ad430dfae9cc1d1e8c7a87f",
      courseName: "getting started with react",
      courseDescription: "full stack web development",
      thumbnail: "https://res.cloudinary.com/vdb7edqa/image/upload/v1792291038/LiveCode/ci7e5inaazu8ckuiwqf1.jpg",
      price: 0,
      totalDuration: "20.8s",
      progressPercentage: 100,
      createdAt: "2026-10-18T02:37:19.368Z",
      courseContent: [
        {
          _id: "6ad4314bae9cc1d1e8c7a883",
          sectionName: "1: Introduction to React & Project Setup",
          subSection: [
            {
              _id: "6ad432b2ae9cc1d1e8c7a898",
              title: "first code",
              timeDuration: "20.8",
              videoUrl: "https://res.cloudinary.com/vdb7edqa/video/upload/v1792291504/LiveCode/kaof2bve9aiftolzyhvq.mov",
              codeStreamUrl: "https://res.cloudinary.com/vdb7edqa/raw/upload/v1792291505/LiveCode/xnbporcydfvebwrxmcdn"
            }
          ]
        }
      ]
    }
  ]

  if (token && (token.includes("demo_token_") || token.includes("demo"))) {
    return demoFallback
  }

  let result = []
  try {
    const response = await apiConnector("GET", GET_USER_ENROLLED_COURSES_API, {token}, { Authorization: `Bearer ${token}`, })

    console.log("GET_USER_ENROLLED_COURSES_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
    // Graceful fallback for portfolio / demo view
    result = demoFallback
  }
  return result
}

// ================ get Instructor Data  ================
export async function getInstructorData(token) {
  const demoInstructorData = [
    {
      _id: "6ad430dfae9cc1d1e8c7a87f",
      courseName: "getting started with react",
      courseDescription: "full stack web development",
      totalStudentsEnrolled: 1,
      totalAmountGenerated: 0
    }
  ]

  if (token && (token.includes("demo_token_") || token.includes("demo"))) {
    return demoInstructorData
  }

  let result = []
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET_INSTRUCTOR_DATA_API API RESPONSE............", response)
    result = response?.data?.courses
  } catch (error) {
    console.log("GET_INSTRUCTOR_DATA_API API ERROR............", error)
    result = demoInstructorData
  }
  return result
}

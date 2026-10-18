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
      _id: "demo",
      courseName: "LiveCode Interactive Masterclass",
      courseDescription: "Experience real-time synchronized code streaming with in-browser terminal execution.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      price: 2999,
      totalDuration: "20.8s",
      progressPercentage: 100,
      createdAt: new Date().toISOString(),
      courseContent: [
        {
          _id: "demo-section-1",
          sectionName: "1: Interactive LiveCode Engine Demo",
          subSection: [
            {
              _id: "demo-lecture-1",
              title: "Interactive Code Streaming & Terminal Demo",
              timeDuration: "20.8",
              videoUrl: "/sample-video.mp4"
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
      _id: "demo",
      courseName: "LiveCode Interactive Masterclass",
      courseDescription: "Experience real-time synchronized code streaming with in-browser terminal execution.",
      totalStudentsEnrolled: 48,
      totalAmountGenerated: 143952
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

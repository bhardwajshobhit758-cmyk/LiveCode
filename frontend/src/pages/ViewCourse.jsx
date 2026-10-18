import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

import { setCourseViewSidebar } from "../slices/sidebarSlice"




export const DEMO_COURSE_DATA = {
  _id: "6ad430dfae9cc1d1e8c7a87f",
  courseName: "getting started with react",
  courseDescription: "full stack web development",
  thumbnail: "https://res.cloudinary.com/vdb7edqa/image/upload/v1792291038/LiveCode/ci7e5inaazu8ckuiwqf1.jpg",
  price: 0,
  courseContent: [
    {
      _id: "6ad4314bae9cc1d1e8c7a883",
      sectionName: "1: Introduction to React & Project Setup",
      subSection: [
        {
          _id: "6ad432b2ae9cc1d1e8c7a898",
          title: "first code",
          description: "first lecture of react",
          timeDuration: "20.8",
          videoUrl: "https://res.cloudinary.com/vdb7edqa/video/upload/v1792291504/LiveCode/kaof2bve9aiftolzyhvq.mov",
          codeStreamUrl: "https://res.cloudinary.com/vdb7edqa/raw/upload/v1792291505/LiveCode/xnbporcydfvebwrxmcdn",
          initialCode: "// getting started with react\n// Created by Shobhit Bhardwaj\n",
        }
      ]
    }
  ]
}

export default function ViewCourse({ isDemo = false }) {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  // get Full Details Of Course
  useEffect(() => {
    ; (async () => {
      if (isDemo || courseId === "demo" || courseId === "6ad430dfae9cc1d1e8c7a87f" || !courseId || token?.includes("demo_token_")) {
        dispatch(setCourseSectionData(DEMO_COURSE_DATA.courseContent))
        dispatch(setEntireCourseData(DEMO_COURSE_DATA))
        dispatch(setCompletedLectures([]))
        dispatch(setTotalNoOfLectures(1))
        return
      }

      if (!token) {
        dispatch(setCourseSectionData(DEMO_COURSE_DATA.courseContent))
        dispatch(setEntireCourseData(DEMO_COURSE_DATA))
        dispatch(setCompletedLectures([]))
        dispatch(setTotalNoOfLectures(1))
        return
      }

      try {
        const courseData = await getFullDetailsOfCourse(courseId, token)
        if (courseData && courseData.courseDetails) {
          dispatch(setCourseSectionData(courseData.courseDetails.courseContent || []))
          dispatch(setEntireCourseData(courseData.courseDetails))
          dispatch(setCompletedLectures(courseData.completedVideos || []))
          let lectures = 0
          courseData?.courseDetails?.courseContent?.forEach((sec) => {
            lectures += sec.subSection?.length || 0
          })
          dispatch(setTotalNoOfLectures(lectures))
        } else {
          dispatch(setCourseSectionData(DEMO_COURSE_DATA.courseContent))
          dispatch(setEntireCourseData(DEMO_COURSE_DATA))
          dispatch(setCompletedLectures([]))
          dispatch(setTotalNoOfLectures(1))
        }
      } catch (err) {
        dispatch(setCourseSectionData(DEMO_COURSE_DATA.courseContent))
        dispatch(setEntireCourseData(DEMO_COURSE_DATA))
        dispatch(setCompletedLectures([]))
        dispatch(setTotalNoOfLectures(1))
      }
    })()

  }, [courseId, isDemo, token])


  // handle sidebar for small devices
  const { courseViewSidebar } = useSelector(state => state.sidebar)
  const [screenSize, setScreenSize] = useState(undefined)

  // set curr screen Size
  useEffect(() => {
    const handleScreenSize = () => setScreenSize(window.innerWidth)

    window.addEventListener('resize', handleScreenSize);
    handleScreenSize();
    return () => window.removeEventListener('resize', handleScreenSize);
  })

  // close / open sidebar according screen size
  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setCourseViewSidebar(false))
    } else dispatch(setCourseViewSidebar(true))
  }, [screenSize])


  return (
    <>
      <div className="relative flex h-[calc(100vh-4rem)] pt-16">
        {/* view course side bar */}
        {courseViewSidebar && <VideoDetailsSidebar setReviewModal={setReviewModal} isDemo={isDemo || courseId === "demo" || !courseId} />}

        <div className="h-full flex-1 overflow-y-auto">
          <div className="mx-6 pb-6">
            <Outlet />
          </div>
        </div>
      </div>


      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}

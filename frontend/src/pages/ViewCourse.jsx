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
  _id: "demo",
  courseName: "LiveCode Interactive Masterclass",
  courseDescription: "Experience real-time synchronized code streaming with in-browser terminal execution.",
  thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
  courseContent: [
    {
      _id: "demo-section-1",
      sectionName: "1: Interactive LiveCode Engine Demo",
      subSection: [
        {
          _id: "demo-lecture-1",
          title: "Interactive Code Streaming & Terminal Demo",
          description: "Watch code stream in real-time as the video plays. Click 'Fork & Experiment Offline' to edit the code and test it live in an in-browser Linux/Node.js terminal powered by WebContainers!",
          timeDuration: "20.8",
          videoUrl: "/sample-video.mp4",
          codeStreamUrl: "https://res.cloudinary.com/vdb7edqa/raw/upload/v1792291505/LiveCode/xnbporcydfvebwrxmcdn",
          initialCode: "// LiveCode Interactive Demo\n// Watch code stream automatically with video playback!\n",
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
      if (isDemo || courseId === "demo" || !courseId) {
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

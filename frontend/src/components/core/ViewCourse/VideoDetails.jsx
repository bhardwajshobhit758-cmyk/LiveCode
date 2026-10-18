import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"

import IconBtn from "../../common/IconBtn"

import { HiMenuAlt1 } from 'react-icons/hi'
import InteractiveTerminalPlayer from './InteractiveTerminalPlayer'


const VideoDetails = ({ isDemo = false }) => {
  const { courseId, sectionId, subSectionId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  const isDemoCourse = isDemo || courseId === "demo" || !courseId

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData || !courseSectionData.length) return

      if (isDemoCourse) {
        const targetSection = (sectionId && courseSectionData.find((sec) => sec._id === sectionId)) || courseSectionData[0]
        const targetSubSection = (subSectionId && targetSection?.subSection?.find((sub) => sub._id === subSectionId)) || targetSection?.subSection?.[0]
        
        if (targetSubSection) {
          setVideoData(targetSubSection)
        }
        setPreviewSource(courseEntireData?.thumbnail || "")
        setVideoEnded(false)
        return
      }

      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        const filteredVideoData = filteredData?.[0]?.subSection?.filter(
          (data) => data._id === subSectionId
        )
        if (filteredVideoData && filteredVideoData[0]) {
          setVideoData(filteredVideoData[0])
        } else if (courseSectionData[0]?.subSection?.[0]) {
          setVideoData(courseSectionData[0].subSection[0])
        }
        setPreviewSource(courseEntireData?.thumbnail || "")
        setVideoEnded(false)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname, sectionId, subSectionId, courseId, isDemoCourse])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    if (!courseSectionData || !courseSectionData.length) return true
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === (sectionId || courseSectionData[0]?._id))
    if (currentSectionIndx === -1 || !courseSectionData[currentSectionIndx]?.subSection) return true

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === (subSectionId || courseSectionData[currentSectionIndx]?.subSection?.[0]?._id))

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    if (!courseSectionData || !courseSectionData.length) return
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === (sectionId || courseSectionData[0]?._id))
    if (currentSectionIndx === -1 || !courseSectionData[currentSectionIndx]?.subSection) return

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === (subSectionId || courseSectionData[currentSectionIndx]?.subSection?.[0]?._id))

    const basePath = isDemoCourse ? "/demo" : `/view-course/${courseId}`

    if (currentSubSectionIndx !== -1 && currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id
      navigate(`${basePath}/section/${courseSectionData[currentSectionIndx]._id}/sub-section/${nextSubSectionId}`)
    } else if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection?.[0]?._id
      if (nextSubSectionId) {
        navigate(`${basePath}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
      }
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    if (!courseSectionData || !courseSectionData.length) return true
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === (sectionId || courseSectionData[0]?._id))
    if (currentSectionIndx === -1 || !courseSectionData[currentSectionIndx]?.subSection) return true

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === (subSectionId || courseSectionData[currentSectionIndx]?.subSection?.[0]?._id))

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    if (!courseSectionData || !courseSectionData.length) return
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === (sectionId || courseSectionData[0]?._id))
    if (currentSectionIndx === -1 || !courseSectionData[currentSectionIndx]?.subSection) return

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === (subSectionId || courseSectionData[currentSectionIndx]?.subSection?.[0]?._id))

    const basePath = isDemoCourse ? "/demo" : `/view-course/${courseId}`

    if (currentSubSectionIndx > 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id
      navigate(`${basePath}/section/${courseSectionData[currentSectionIndx]._id}/sub-section/${prevSubSectionId}`)
    } else if (currentSectionIndx > 0) {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength = courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[prevSubSectionLength - 1]._id
      navigate(`${basePath}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }
  }

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    if (isDemoCourse || !token) {
      dispatch(updateCompletedLectures(subSectionId || videoData?._id || "demo-lecture-1"))
      return
    }
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  // this will hide course video , title , desc, if sidebar is open in small device
  // for good looking i have try this 
  if (courseViewSidebar && window.innerWidth <= 640) return;

  return (
    <div className="flex flex-col gap-5 text-white w-full h-full mt-4">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer z-50" onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>

      <div className="flex flex-col xl:flex-row gap-6 w-full h-full">
        {/* Left Column: Video and Info */}
        <div className="flex flex-col xl:w-1/2">
          {!videoData ? (
            <img
              src={previewSource}
              alt="Preview"
              className="w-full aspect-video rounded-xl object-cover shadow-lg border border-white/10"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black aspect-video">
              <Player
                ref={playerRef}
                aspectRatio="16:9"
                playsInline
                autoPlay
                onEnded={() => setVideoEnded(true)}
                src={
                  videoData?.videoUrl &&
                  !videoData.videoUrl.includes("images.unsplash.com") &&
                  !videoData.videoUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) &&
                  !videoData.videoUrl.includes("commondatastorage.googleapis.com")
                    ? videoData.videoUrl
                    : "/sample-video.mp4"
                }
                crossOrigin="anonymous"
              >
                <BigPlayButton position="center" />
                {/* Render When Video Ends */}
                {videoEnded && (
                  <div
                    style={{
                      backgroundImage:
                        "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                    }}
                    className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
                  >
                    {!completedLectures.includes(subSectionId) && (
                      <IconBtn
                        disabled={loading}
                        onclick={() => handleLectureCompletion()}
                        text={!loading ? "Mark As Completed" : "Loading..."}
                        customClasses="text-xl max-w-max px-4 mx-auto"
                      />
                    )}
                    <IconBtn
                      disabled={loading}
                      onclick={() => {
                        if (playerRef?.current) {
                          // set the current time of the video to 0
                          playerRef?.current?.seek(0)
                          setVideoEnded(false)
                        }
                      }}
                      text="Rewatch"
                      customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                    />

                    <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                      {!isFirstVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToPrevVideo}
                          className="blackButton"
                        >
                          Prev
                        </button>
                      )}
                      {!isLastVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToNextVideo}
                          className="blackButton"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Player>
            </div>
          )}

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-white tracking-wide">{videoData?.title}</h1>
            <p className="mt-3 text-richblack-300 leading-relaxed">{videoData?.description}</p>
          </div>
        </div>

        {/* Right Column: Interactive Terminal Player */}
        <div className="flex flex-col xl:w-1/2 h-[600px] xl:h-auto min-h-[600px] border border-white/10 rounded-xl overflow-hidden bg-[#0B0F19]">
          <InteractiveTerminalPlayer videoData={videoData} playerRef={playerRef} />
        </div>
      </div>
    </div>
  )
}

export default VideoDetails

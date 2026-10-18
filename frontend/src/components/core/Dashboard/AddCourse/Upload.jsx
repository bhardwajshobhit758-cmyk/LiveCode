import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"

import "video-react/dist/video-react.css"
import { Player } from "video-react"



export default function Upload({ name, label, register, setValue, errors, video = false, viewData = null, editData = null, }) {
  // const { course } = useSelector((state) => state.course)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(viewData ? viewData : editData ? editData : "")
  const inputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      previewFile(file)
      setSelectedFile(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".svg"] }
      : { "video/*": [".mp4", ".mkv", ".webm"] },
    onDrop,
    noClick: false,
    noKeyboard: false,
  })

  const previewFile = (file) => {
    // console.log(file)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  useEffect(() => {
    register(name, { required: true })
  }, [register])


  useEffect(() => {
    setValue(name, selectedFile)
  }, [selectedFile, setValue])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>

      <div
        className={`${isDragActive ? "bg-richblack-600" : "bg-richblack-700"}
         flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
        {...(!previewSource ? getRootProps() : {})}
      >
        <input {...getInputProps()} id={name} />
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover max-h-[350px]"
                crossOrigin="anonymous"
              />
            ) : (
                <Player
                  aspectRatio="16:9"
                  playsInline
                  src={previewSource}
                  crossOrigin="anonymous"
                />
            )}

            {!viewData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-3 text-richblack-400 underline hover:text-richblack-200"
              >
                Cancel / Choose another
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6 text-center select-none">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[260px] text-center text-sm text-richblack-200">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  open()
                }}
                className="font-semibold text-yellow-50 underline cursor-pointer hover:text-yellow-100"
              >
                Browse
              </span>{" "}
              a file
            </p>
            <ul className="mt-8 flex list-disc justify-between space-x-12 text-center text-xs text-richblack-200">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
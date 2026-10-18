import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { RiDeleteBin6Line } from 'react-icons/ri'




export default function RequirementsField({ name, label, register, setValue, errors, }) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 }, requirementsList)
  }, [])

  useEffect(() => {
    setValue(name, requirementsList)
  }, [requirementsList])

  // add instruction
  const handleAddRequirement = () => {
    const trimmed = requirement.trim()
    if (trimmed && !requirementsList.includes(trimmed)) {
      setRequirementsList([...requirementsList, trimmed])
      setRequirement("")
    }
  }

  // delete instruction
  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddRequirement()
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex flex-col items-start space-y-2 w-full">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            id={name}
            placeholder="Type a prerequisite and press Enter (or click Add)"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            onKeyDown={handleKeyDown}
            className="form-style w-full"
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            className="rounded-md bg-yellow-50 px-4 py-2 text-xs font-semibold text-richblack-900 hover:bg-yellow-100 transition duration-150 flex-shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {requirementsList.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {requirementsList.map((req, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-richblack-700/60 px-3 py-1.5 rounded-lg border border-richblack-600/50 text-sm text-richblack-5"
            >
              <span className="truncate mr-2">• {req}</span>
              <button
                type="button"
                className="text-pink-300 hover:text-pink-100 transition p-1"
                onClick={() => handleRemoveRequirement(index)}
                aria-label="Remove requirement"
              >
                <RiDeleteBin6Line size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required (please add at least one)
        </span>
      )}
    </div>
  )
}
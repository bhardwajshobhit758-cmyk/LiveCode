import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { VscHistory, VscPass, VscBook } from "react-icons/vsc"
import { FiCheckCircle, FiExternalLink, FiShoppingBag } from "react-icons/fi"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import { formatDate } from "../../../services/formatDate"
import Img from "../../common/Img"

export default function PurchaseHistory() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [purchasedCourses, setPurchasedCourses] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true)
      try {
        const res = await getUserEnrolledCourses(token)
        setPurchasedCourses(res || [])
      } catch (error) {
        console.error("Could not fetch purchase history:", error)
        setPurchasedCourses([])
      }
      setLoading(false)
    }

    fetchPurchases()
  }, [token])

  const totalSpent = purchasedCourses?.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-boogaloo text-richblack-5">Purchase History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 w-full rounded-xl bg-richblack-800 animate-pulse border border-richblack-700" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-boogaloo text-richblack-5 flex items-center gap-2">
          <VscHistory className="text-yellow-50 text-3xl" /> Purchase History
        </h1>
        <p className="text-sm text-richblack-300 mt-1">
          Review all your purchased courses, order summaries, and payment transactions.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-richblack-800 p-5 rounded-2xl border border-richblack-700 flex flex-col justify-between">
          <span className="text-xs font-medium text-richblack-400 uppercase tracking-wider">Total Orders</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-white">{purchasedCourses?.length || 0}</span>
            <div className="p-2.5 rounded-xl bg-yellow-50/10 text-yellow-50">
              <FiShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-richblack-800 p-5 rounded-2xl border border-richblack-700 flex flex-col justify-between">
          <span className="text-xs font-medium text-richblack-400 uppercase tracking-wider">Total Amount Spent</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-caribbeangreen-200">₹{totalSpent.toLocaleString("en-IN")}</span>
            <div className="p-2.5 rounded-xl bg-caribbeangreen-500/10 text-caribbeangreen-300">
              <VscPass size={20} />
            </div>
          </div>
        </div>

        <div className="bg-richblack-800 p-5 rounded-2xl border border-richblack-700 flex flex-col justify-between">
          <span className="text-xs font-medium text-richblack-400 uppercase tracking-wider">Active Enrollments</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-white">{purchasedCourses?.length || 0}</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300">
              <VscBook size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Course Purchase Items Table */}
      {purchasedCourses && purchasedCourses.length > 0 ? (
        <div className="bg-richblack-800 rounded-2xl border border-richblack-700 overflow-hidden">
          {/* Desktop Table Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-richblack-700/60 text-xs font-semibold uppercase text-richblack-200 border-b border-richblack-700">
            <div className="col-span-5">Course</div>
            <div className="col-span-2 text-center">Order ID</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-1 text-center">Price</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-richblack-700">
            {purchasedCourses.map((course, idx) => {
              const orderId = `ORD-${(course._id || "").slice(-8).toUpperCase()}`
              const purchaseDate = course.createdAt ? formatDate(course.createdAt) : "Recent"
              const firstSubSectionId = course.courseContent?.[0]?.subSection?.[0]?._id
              const firstSectionId = course.courseContent?.[0]?._id

              return (
                <div
                  key={course._id || idx}
                  className="p-5 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center hover:bg-richblack-700/30 transition-all duration-200"
                >
                  {/* Course Details */}
                  <div className="col-span-5 flex items-center gap-4 w-full">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-14 w-20 rounded-xl object-cover border border-richblack-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-richblack-5 truncate">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-richblack-400 truncate mt-0.5">
                        {course.courseDescription || "Full lifetime access"}
                      </p>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="col-span-2 text-xs font-mono text-richblack-300 md:text-center w-full flex justify-between md:block">
                    <span className="md:hidden text-richblack-400 font-sans">Order ID: </span>
                    <span className="bg-richblack-900 px-2.5 py-1 rounded-md border border-richblack-700/60">
                      {orderId}
                    </span>
                  </div>

                  {/* Purchase Date */}
                  <div className="col-span-2 text-xs text-richblack-300 md:text-center w-full flex justify-between md:block">
                    <span className="md:hidden text-richblack-400 font-sans">Date: </span>
                    {purchaseDate}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 text-sm font-semibold text-caribbeangreen-200 md:text-center w-full flex justify-between md:block">
                    <span className="md:hidden text-richblack-400 font-sans font-normal text-xs">Price: </span>
                    ₹{(Number(course.price) || 0).toLocaleString("en-IN")}
                  </div>

                  {/* Status & Action */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end gap-3 w-full">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-caribbeangreen-900/40 text-caribbeangreen-300 border border-caribbeangreen-500/30">
                      <FiCheckCircle size={12} />
                      Paid
                    </span>

                    {firstSectionId && firstSubSectionId ? (
                      <Link
                        to={`/view-course/${course._id}/section/${firstSectionId}/sub-section/${firstSubSectionId}`}
                        className="text-xs font-medium text-yellow-50 hover:underline flex items-center gap-1"
                      >
                        View <FiExternalLink size={12} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="text-xs font-medium text-yellow-50 hover:underline flex items-center gap-1"
                      >
                        Details <FiExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-richblack-800 rounded-3xl border border-richblack-700 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-richblack-700 flex items-center justify-center text-richblack-300 text-2xl">
            <VscHistory />
          </div>
          <h2 className="text-xl font-bold text-richblack-5">No Purchase History Found</h2>
          <p className="text-sm text-richblack-300 max-w-md">
            You haven't purchased or enrolled in any courses yet. Once you complete checkout, your order receipts and invoices will be listed here.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 bg-yellow-50 hover:bg-yellow-100 text-richblack-900 font-semibold px-6 py-2.5 rounded-xl transition duration-200"
          >
            Explore Courses
          </button>
        </div>
      )}
    </div>
  )
}

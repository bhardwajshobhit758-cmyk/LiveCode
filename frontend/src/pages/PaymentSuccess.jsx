import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { verifyStripePayment } from "../services/operations/studentFeaturesAPI";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || params.get("sessionId");

    if (!sessionId) {
      toast.error("No session id provided");
      navigate("/");
      return;
    }

    (async () => {
      try {
        await verifyStripePayment(sessionId, token, navigate, dispatch);
      } catch (err) {
        console.log(err);
        toast.error("Could not verify payment");
        navigate("/");
      }
    })();
  }, [dispatch, navigate, token]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Processing payment...</h2>
        <p className="mt-2">Please wait while we verify your purchase.</p>
      </div>
    </div>
  );
}

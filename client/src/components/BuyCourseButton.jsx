import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const navigate = useNavigate();
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    try {
      const res = await createCheckoutSession(courseId).unwrap();
      if (res?.isFree && res?.url) {
        toast.success(res?.message || "Enrolled in course successfully!");
        navigate(`/course-progress/${courseId}`);
      } else if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.error("Failed to generate checkout session URL");
      }
    } catch (err) {
      console.error("Purchase course error:", err);
      if (err?.status === 401) {
        toast.error("Please sign in to purchase this course");
        navigate("/login");
        return;
      }
      if (err?.data?.alreadyEnrolled) {
        toast.info(err?.data?.message || "You already own this course!");
        navigate(`/course-progress/${courseId}`);
        return;
      }
      const errMsg =
        err?.data?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        err?.error ||
        "Failed to create checkout session";
      toast.error(errMsg);
    }
  };

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Checkout...
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;


"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import CreateUserFormUI from "./UI/creareUI"; // Ensure this path is correct
import { createUser, getUserById } from "@/ApiS/userApi"; // Ensure this path is correct
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  picture: File | null; // This will be the user's primary image (captured or uploaded)
  swapPicture: File | null; // This will be the image whose face is swapped onto the primary
}

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  termsAccepted: false,
  picture: null,
  swapPicture: null,
};

const validationSchemaUser = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabetic characters are allowed")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),

  email: Yup.string()
    .email("Invalid email")
    .min(5, "Email must be at least 5 characters")
    .max(40, "Email must be at most 40 characters")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^\d{10}$/, "Phone must be exactly 10 digits")
    .required("Phone is required"),

  termsAccepted: Yup.boolean().oneOf(
    [true],
    "You must accept terms & conditions"
  ),

  picture: Yup.mixed<File>()
    .required("Your picture is required")
    .test("fileSize", "File too large, max 2MB", (file) =>
      file ? file.size <= 2 * 1024 * 1024 : true
    )
    .test("fileType", "Unsupported file format", (file) =>
      file ? ["image/jpg", "image/jpeg", "image/png"].includes(file.type) : true
    ),

  swapPicture: Yup.mixed<File>()
    .required("Target picture for face swap is required")
    .test("fileSize", "File too large, max 2MB", (file) =>
      file ? file.size <= 2 * 1024 * 1024 : true
    )
    .test("fileType", "Unsupported file format", (file) =>
      file ? ["image/jpg", "image/jpeg", "image/png"].includes(file.type) : true
    ),
});

const CreateUserForm: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateUserFormContent />
    </Suspense>
  );
};

const CreateUserFormContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPreview, setUserPreview] = useState<{
    picture: string | null;
    swapPicture: string | null;
  }>({
    picture: null,
    swapPicture: null,
  });
  const [swappedImagePreview, setSwappedImagePreview] = useState<string | null>(
    null
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ✅ CHANGED: Using the specified environment variable for the API key
  const FACE_SWAP_API_KEY = process.env.NEXT_PUBLIC_AI_API_Key;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "captured-photo.png", {
              type: "image/png",
            });
            formik.setFieldValue("picture", capturedFile);
            setUserPreview((prev) => ({
              ...prev,
              picture: URL.createObjectURL(capturedFile),
            }));
            stopCamera();
          }
        }, "image/png");
      }
    }
  };

  // ✅ Fixed handleFaceSwap using LightX v2 API flow
  const handleFaceSwap = async (
    originalFile: File,
    swapFile: File
  ): Promise<string | null> => {
    setLoading(true);
    try {
      // console.log("Client Sending Files:", {
      //   originalFile: {
      //     name: originalFile.name,
      //     type: originalFile.type,
      //     size: originalFile.size,
      //   },
      //   swapFile: {
      //     name: swapFile.name,
      //     type: swapFile.type,
      //     size: swapFile.size,
      //   },
      // });
      const formData = new FormData();
      formData.append("originalFile", originalFile);
      formData.append("swapFile", swapFile);
      const res = await axios.post("/api/faceswap", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data;
      setSwappedImagePreview(data.imageUrl);
      toast.success("Face swap successful! See preview below.");
      return data.imageUrl;
    } catch (error: any) {
      console.error("Face swap failed:", error);
      toast.error(
        error.response?.data?.error || error.message || "Something went wrong."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    setLoading(true);
    setSwappedImagePreview(null);

    try {
      if (!values.picture || !values.swapPicture) {
        toast.error("Please provide both your picture and the swap picture.");
        setLoading(false);
        return;
      }

      // The API expects the user's face ('picture') as the source
      // and the image to be modified ('swapPicture') as the target.
      const swappedImageUrl = await handleFaceSwap(
        values.picture,
        values.swapPicture
      );

      if (!swappedImageUrl) {
        throw new Error("Face swap failed, cannot submit.");
      }

      // Convert the resulting URL to a File object for backend submission
      const response = await fetch(swappedImageUrl);
      const swappedBlob = await response.blob();
      const swappedFile = new File([swappedBlob], "swapped-face.jpg", {
        type: swappedBlob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("termsAccepted", String(values.termsAccepted));
      formData.append("picture", values.picture); // Original user picture
      formData.append("swapPicture", swappedFile); // The API-generated swapped image

      const resp = await createUser(formData);

      if (resp?.status === 201) {
        toast.success(resp?.data?.message, { autoClose: 1000 });
        router.push("/detail");
      }
    } catch (error: any) {
      toast.error(error?.message || "Submission failed!", {
        autoClose: 2000,
      });
    } finally {
      actions.setSubmitting(false);
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemaUser,
    onSubmit: handleSubmit,
  });

  // Effect for displaying live preview of uploaded/captured images
  useEffect(() => {
    // Clean up previous URLs to prevent memory leaks
    return () => {
      if (userPreview.picture) URL.revokeObjectURL(userPreview.picture);
      if (userPreview.swapPicture) URL.revokeObjectURL(userPreview.swapPicture);
      // Swapped image is a remote URL from the API, no need to revoke
    };
  }, [userPreview.picture, userPreview.swapPicture]);

  useEffect(() => {
    if (formik.values.picture instanceof File) {
      setUserPreview((prev) => ({
        ...prev,
        picture: URL.createObjectURL(formik.values.picture as File),
      }));
    } else if (formik.values.picture === null) {
      setUserPreview((prev) => ({ ...prev, picture: null }));
    }

    if (formik.values.swapPicture instanceof File) {
      setUserPreview((prev) => ({
        ...prev,
        swapPicture: URL.createObjectURL(formik.values.swapPicture as File),
      }));
    } else if (formik.values.swapPicture === null) {
      setUserPreview((prev) => ({ ...prev, swapPicture: null }));
    }
  }, [formik.values.picture, formik.values.swapPicture]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const getByIdUser = async (id: any) => {
    try {
      setLoading(true);
      const resp = await getUserById(id);
      if (resp?.status === 200) {
        const user = resp?.data?.user;
        const pictureBase64 = user.picture?.data
          ? `data:${user.picture.contentType};base64,${user.picture.data}`
          : null;
        const swapPictureBase64 = user.swapPicture?.data
          ? `data:${user.swapPicture.contentType};base64,${user.swapPicture.data}`
          : null;
        formik.setValues({
          name: user.name,
          email: user.email,
          phone: user.phone,
          termsAccepted: user.termsAccepted,
          picture: null,
          swapPicture: null,
        });
        setUserPreview({ picture: pictureBase64, swapPicture: null });
        setSwappedImagePreview(swapPictureBase64);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to fetch user.", {
        autoClose: 1000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userID = searchParams.get("userId");
    if (userID) {
      getByIdUser(userID);
    }
  }, [searchParams]);

  return (
    <CreateUserFormUI
      {...formik}
      loading={loading}
      userPreview={userPreview}
      swappedImagePreview={swappedImagePreview}
      isCameraActive={isCameraActive}
      startCamera={startCamera}
      stopCamera={stopCamera}
      capturePhoto={capturePhoto}
    />
  );
};

export default CreateUserForm;

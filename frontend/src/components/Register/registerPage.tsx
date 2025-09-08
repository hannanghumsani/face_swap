"use client";
import React, { useState } from "react";
import RegisterPage from "./UI/registerPageUI";
import * as Yup from "yup";
import { useFormik, FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { registerUser } from "@/ApiS/userApi";

interface FormValues {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: FormValues = {
  firstName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validationSchemaUser = Yup.object({
  firstName: Yup.string()
    .matches(/^[A-Za-z]+$/, "Only alphabetic characters are allowed")
    .min(3, "First name must be at least 3 characters")
    .max(30, "First name must be at most 30 characters")
    .required("First name is required"),

  email: Yup.string()
    .email("Invalid email")
    .min(5, "Email must be at least 5 characters")
    .max(40, "Email must be at most 40 characters")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const RegisterPageContainer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    try {
      // console.log("Form Submitted:", values);
      setLoading(true);
      const resp = await registerUser(values);

      if (resp.status === 201) {
        toast.success(resp?.data?.message || "Registration successful!", {
          position: "top-right",
          autoClose: 1000,
        });
        router.push("/");
      } else {
        throw new Error(resp?.data?.message || "Something went wrong!");
      }
    } catch (error: any) {
      toast.error(error.data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemaUser,
    onSubmit: handleSubmit,
  });

  return <RegisterPage {...formik} loading={loading} />;
};

export default RegisterPageContainer;

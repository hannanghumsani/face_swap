"use client";
import React, { useState } from "react";
import LoginPage from "./UI/LoginUi";
import * as Yup from "yup";
import { useFormik, FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { loginUser } from "@/ApiS/userApi";
import { setCookie } from "cookies-next";

interface FormValues {
  email: string;
  password: string;
}

const initialValues: FormValues = {
  email: "",
  password: "",
};

const validationSchemaUser = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .min(5, "Email must be at least 5 characters")
    .max(40, "Email must be at most 40 characters")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters")
    .required("Password is required"),
});

const LoginPageContainer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    try {
      // console.log("Login Attempt:", values);
      setLoading(true);

      const resp = await loginUser(values);

      if (resp.status === 200) {
        setCookie("token", resp?.data.token, { maxAge: 60 * 60 * 24 * 7 });
        toast.success(resp?.data?.message || "Login successful!", {
          position: "top-right",
          autoClose: 1000,
        });
        router.push("/detail");
      } else {
        throw new Error(resp?.data?.message || "Invalid credentials!");
      }
    } catch (error: any) {
      toast.error(error.data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      // setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemaUser,
    onSubmit: handleSubmit,
  });

  return <LoginPage {...formik} loading={loading} />;
};

export default LoginPageContainer;

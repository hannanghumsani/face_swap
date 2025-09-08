"use client";
import React from "react";
import { Container, Button, Card, Spinner } from "react-bootstrap";
import FormInput from "../../../commonComp/inputField";
import Link from "next/link";
import { FormikProps } from "formik";

interface FormValues {
  email: string;
  password: string;
}

interface CustomProps {
  loading: boolean;
}

type LoginPageUiProps = FormikProps<FormValues> & CustomProps;

const LoginPageUi: React.FC<LoginPageUiProps> = ({
  handleSubmit,
  handleChange,
  handleBlur,
  values,
  touched,
  errors,
  loading,
}) => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 text-white bg-dark" style={{ width: "22rem" }}>
        {loading ? (
          <Spinner variant="light" />
        ) : (
          <Card.Body>
            <h3 className="text-center mb-4">Login</h3>
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Email address"
                type="email"
                controlId="email"
                placeholder="Enter email"
                inputClass="bg-secondary text-white"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.email && errors.email && (
                <div className="text-danger mb-2">{errors.email}</div>
              )}

              <FormInput
                label="Password"
                type="password"
                controlId="password"
                placeholder="Enter password"
                inputClass="bg-secondary text-white"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.password && errors.password && (
                <div className="text-danger mb-2">{errors.password}</div>
              )}

              <Button
                variant="primary"
                className="w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "Login"}
              </Button>
            </form>

            <div className="text-center mt-3">
              <Link href="/register" className="text-white-50">
                {"Don't have an account? Register"}
              </Link>
            </div>
          </Card.Body>
        )}
      </Card>
    </Container>
  );
};

export default LoginPageUi;

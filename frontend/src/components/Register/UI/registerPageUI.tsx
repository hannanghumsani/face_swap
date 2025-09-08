'use client'
import React from "react";
import { Container, Button, Card, Form, Spinner } from "react-bootstrap";
import FormInput from "../../../commonComp/inputField";
import Link from "next/link";
import { FormikProps } from "formik";

interface FormValues {
    firstName: string;
    email: string;
    password: string;
    confirmPassword: string;
}
interface CustomProps {
    loading: boolean;
}
type CreateUserFormProps = FormikProps<FormValues> & CustomProps;


const RegisterPage: React.FC<CreateUserFormProps> = ({ handleSubmit, handleChange, handleBlur, values, touched, errors, loading }) => {
    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-4 text-white bg-dark" style={{ width: "25rem" }}>
                {loading ? <Spinner variant="light" /> : <Card.Body>
                    <h3 className="text-center mb-4">Register</h3>
                    <Form noValidate onSubmit={handleSubmit}>
                        <FormInput
                            label="First Name"
                            type="text"
                            controlId="firstName"
                            placeholder="Enter first name"
                            divClass="mb-3"
                            inputClass="bg-secondary text-white"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched?.firstName && !!errors?.firstName}
                            errorMessage={errors.firstName}
                            required
                        />

                        <FormInput
                            label="Email Address"
                            type="email"
                            controlId="email"
                            placeholder="Enter email"
                            divClass="mb-3"
                            inputClass="bg-secondary text-white"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched?.email && !!errors.email}
                            errorMessage={errors.email}
                            required
                        />
                        <FormInput
                            label="Password"
                            type="password"
                            controlId="password"
                            placeholder="Enter password"
                            divClass="mb-3"
                            inputClass="bg-secondary text-white"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched?.password && !!errors.password}
                            errorMessage={errors.password}
                            required
                        />
                        <FormInput
                            label="Confirm Password"
                            type="password"
                            controlId="confirmPassword"
                            placeholder="Confirm password"
                            divClass="mb-3"
                            inputClass="bg-secondary text-white"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={touched?.confirmPassword && !!errors.confirmPassword}
                            errorMessage={errors.confirmPassword}
                            required
                        />
                        <Button variant="primary" className="w-100" type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Link href="/" className="text-white-50">Already have an account? Login</Link>
                    </div>
                </Card.Body>}

            </Card>
        </Container>
    );
};

export default RegisterPage;

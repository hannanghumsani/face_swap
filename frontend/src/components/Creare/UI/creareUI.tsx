"use client";
import React from "react";
import { FormikProps } from "formik";
import { useSearchParams } from "next/navigation";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  picture: File | null;
  swapPicture: File | null;
}

interface CustomProps {
  loading: boolean;
  userPreview?: {
    picture: string | null; // Preview for the main user image (uploaded/captured)
    swapPicture: string | null; // Preview for the image for face-swapping
  };
  swappedImagePreview: string | null; // Preview for the API-generated swapped image
  isCameraActive: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  capturePhoto: () => void;
}

type CreateUserFormProps = FormikProps<FormValues> & CustomProps;

const CreateUserFormUI: React.FC<CreateUserFormProps> = ({
  handleSubmit,
  handleChange,
  handleBlur,
  values,
  touched,
  errors,
  setFieldValue,
  loading,
  userPreview,
  swappedImagePreview,
  isCameraActive,
  startCamera,
  stopCamera,
  capturePhoto,
}) => {
  const searchParams = useSearchParams();
  const isViewMode = !!searchParams.get("userId");

  const handleDownload = () => {
    if (swappedImagePreview) {
      const link = document.createElement("a");
      link.href = swappedImagePreview;
      link.download = "swapped-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h3 className="text-3xl font-bold text-center text-cyan-400 mb-8">
          {isViewMode
            ? "View User Profile"
            : "Create User Profile with Face Swap"}
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isViewMode}
                  className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isViewMode}
                  className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Enter 10-digit phone number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isViewMode}
                  className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {!isViewMode && (
              <>
                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-xl font-semibold text-cyan-300 mb-4">
                    Your Primary Picture
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Camera Capture Option */}
                    <div className="flex flex-col items-center">
                      {/* {isCameraActive && (
                        <div className="flex flex-col items-center">
                          <video
                            ref={videoRef}
                            className="w-full max-w-sm rounded-lg shadow-md border border-gray-600 mb-4"
                            autoPlay
                            playsInline
                          />
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-6 py-3 rounded-full text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Take Photo
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-6 py-3 rounded-full text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Stop Camera
                            </button>
                          </div>
                        </div>
                      )} */}

                      {/* <p className="text-gray-400 text-sm mt-4 mb-2">OR</p> */}

                      {/* File Upload Option for Primary Picture */}
                      <label
                        htmlFor="picture"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Upload Your Picture (max 2MB)
                      </label>
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          setFieldValue("picture", e.currentTarget.files?.[0]);
                          if (isCameraActive) stopCamera(); // Stop camera if file is uploaded
                        }}
                        className="block w-full text-sm text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-cyan-50 file:text-cyan-700
                     hover:file:bg-cyan-100"
                      />
                      {touched.picture && errors.picture && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.picture as string}
                        </p>
                      )}
                    </div>

                    {/* Preview for Primary Picture */}
                    <div className="flex flex-col items-center justify-center">
                      {userPreview?.picture && (
                        <div className="mt-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">
                            Your Picture Preview
                          </p>
                          <img
                            src={userPreview.picture}
                            alt="Your Picture Preview"
                            className="w-40 h-40 object-cover rounded-full mx-auto shadow-md border-2 border-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Swap Picture Section */}
                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-xl font-semibold text-cyan-300 mb-4">
                    Picture to Swap Face With
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Upload Option for Swap Picture */}
                    <div className="flex flex-col items-center">
                      <label
                        htmlFor="swapPicture"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Upload Target Picture (max 2MB)
                      </label>
                      <input
                        id="swapPicture"
                        name="swapPicture"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) =>
                          setFieldValue(
                            "swapPicture",
                            e.currentTarget.files?.[0]
                          )
                        }
                        className="block w-full text-sm text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-cyan-50 file:text-cyan-700
                     hover:file:bg-cyan-100"
                      />
                      {touched.swapPicture && errors.swapPicture && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.swapPicture as string}
                        </p>
                      )}
                    </div>

                    {/* Preview for Swap Picture */}
                    <div className="flex flex-col items-center justify-center">
                      {userPreview?.swapPicture && (
                        <div className="mt-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">
                            Swap Picture Preview
                          </p>
                          <img
                            src={userPreview.swapPicture}
                            alt="Swap Picture Preview"
                            className="w-40 h-40 object-cover rounded-full mx-auto shadow-md border-2 border-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* API Generated Swapped Image Preview (Always visible if available) */}
            {swappedImagePreview && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-xl font-semibold text-emerald-300 mb-4 text-center">
                  API Generated Swapped Image
                </h4>
                <div className="flex justify-center">
                  <img
                    src={swappedImagePreview}
                    alt="API Generated Swapped Face"
                    className="w-64 h-64 object-cover rounded-xl shadow-lg border-4 border-emerald-500"
                  />
                </div>
                {isViewMode && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-6 py-3 rounded-full text-base font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      Download Image
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={values.termsAccepted}
                onChange={handleChange}
                disabled={isViewMode}
                className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 disabled:opacity-50"
              />
              <label
                htmlFor="termsAccepted"
                className="ml-2 block text-sm text-gray-300"
              >
                I accept the terms & conditions
              </label>
            </div>
            {touched.termsAccepted && errors.termsAccepted && (
              <p className="mt-1 text-sm text-red-400">
                {errors.termsAccepted as string}
              </p>
            )}

            {!isViewMode && (
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 rounded-full text-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing Faces..." : "Submit & Generate Swap"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateUserFormUI;

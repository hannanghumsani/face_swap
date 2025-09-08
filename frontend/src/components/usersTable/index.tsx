"use client";

import React, { Fragment, useState } from "react";
import UserTable from "./UI/userTable";
import { deleteUser, getAllUsers } from "../../ApiS/userApi";
// import { useRouter } from "next/router";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";

interface indexSchema {
    metaData: any;
    users: any;
}
function Index({ metaData, users }: indexSchema) {
    const [meta, setMeta] = useState(metaData);
    const [userData, setUserData] = useState(users);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const params = new URLSearchParams(searchParams);


    // const router = useRouter();
    const updatePage = async (newPage: any) => {
        params.set("page", newPage);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        allUsersGet('', newPage);
    };

    const updatePerPage = async (newPerPage: any) => {
        params.set("page", "1");
        params.set("perPage", newPerPage);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        allUsersGet(newPerPage, "1");
    };
    const allUsersGet = async (perPage: any, page: any) => {
        const PerPage = perPage || searchParams.get("perPage") || 10
        const Page = page || searchParams.get("page") || 0
        try {
            setLoading(true);
            const resp = await getAllUsers(+PerPage, +Page);
            if (resp?.status === 200) {
                setMeta(resp?.data?.meta);
                setUserData(resp?.data?.users);
            }

        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };
    const userDelete = async (id: any) => {
        try {
            setLoading(true);
            const resp = await deleteUser(id);

            if (resp?.status === 200) {
                toast.success(resp?.data?.message, {
                    position: "top-right",
                    autoClose: 2500,
                    closeOnClick: true,
                    theme: "colored",
                });
                await allUsersGet("", "");
            }
        } catch (error: any) {
            toast.error(error?.data?.message, {
                position: "top-right",
                autoClose: 1000,
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Fragment>
            <UserTable meta={meta} userData={userData} loading={loading} updatePage={updatePage} updatePerPage={updatePerPage} userDelete={userDelete} />
        </Fragment>
    );
}

export default Index;

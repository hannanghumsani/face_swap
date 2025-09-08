import { Col, Row } from "react-bootstrap";
import UserTable from "@/components/usersTable";
import { getAllUsersSSR } from "@/ApiS/userApi";
import { cookies } from "next/headers";

export default async function Home({
  searchParams,
}: {
  searchParams: { perPage?: string; page?: string };
}) {
  const perPage = searchParams?.perPage || "10";
  const page = searchParams?.page || "1";

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const resp = await getAllUsersSSR(Number(perPage), Number(page), token);

  return (
    <div>
      <UserTable metaData={resp?.data?.meta} users={resp?.data?.users} />
    </div>
  );
}

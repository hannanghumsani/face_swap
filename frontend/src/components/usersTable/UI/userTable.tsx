"use client";
import {
  Table,
  Dropdown,
  DropdownButton,
  Pagination,
  Form,
  Row,
  Col,
  Spinner,
  Button,
} from "react-bootstrap";
import { FaDownload, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
interface TableComponentProps {
  meta: any;
  // showToast: boolean;
  // toastMessage: string;
  userData: any[];
  loading: boolean;
  updatePage: (newPage: number) => void;
  updatePerPage: (newPerPage: number) => void;
  userDelete: (id: string) => void;
}
export default function TableComponent({
  meta,
  userData,
  loading,
  updatePage,
  updatePerPage,
  userDelete,
}: TableComponentProps) {
  const searchParams = useSearchParams();
  const totalPages = meta?.totalPages;

  return (
    <>
      {loading ? (
        <div className="container">
          <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner variant="light" />
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="d-flex justify-content-between text-light">
            <h2 className="text-center text-info mb-4">User List</h2>
            <h2>
              <Link href="/create" passHref>
                <Button> Create User </Button>
              </Link>
            </h2>
          </div>

          <div className="table-responsive">
            <Table striped bordered hover variant="dark" className="text-white">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Number</th>
                  <th className="text-center">Swaped img</th>
                  <th>Date Added</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr key={user?._id}>
                    <td>{user?.name}</td>
                    <td>{user?.email}</td>
                    <td>{user?.phone}</td>
                    <td className="d-flex justify-content-center">
                      {user?.swapPicture?.data ? (
                        <img
                          src={`data:${user.swapPicture.contentType};base64,${user.swapPicture.data}`}
                          alt="profile"
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>
                    <td>{user?.createdAt}</td>
                    <td className="text-center">
                      <DropdownButton variant="secondary" title="">
                        <Dropdown.Item
                          as={Link}
                          href={`/create?userId=${user?._id}`}
                          className="d-flex align-items-center"
                        >
                          <FaEye className="me-2" /> View
                        </Dropdown.Item>
                        {user?.swapPicture?.data && (
                          <Dropdown.Item
                            as="a"
                            download={`${user?.name || "profile"}.png`} // filename
                            href={`data:${user.swapPicture.contentType};base64,${user.swapPicture.data}`}
                            className="d-flex align-items-center"
                          >
                            <FaDownload className="me-2" /> Download Swapped Img
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onClick={() => userDelete(user?._id)}
                          className="d-flex align-items-center text-danger"
                        >
                          <FaTrash className="me-2" /> Delete
                        </Dropdown.Item>
                      </DropdownButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Row className="justify-content-between align-items-center mt-3">
            <Col xs={12} md="auto" className="mb-2 mb-md-0">
              <Form.Select
                value={searchParams.get("perPage")?.toString()}
                onChange={(e) => {
                  updatePerPage(parseInt(e.target.value, 10));
                }}
                className="w-auto"
              >
                <option value="10">10 per page</option>
                <option value="15">15 per page</option>
                <option value="20">20 per page</option>
              </Form.Select>
            </Col>

            <Col xs={12} md="auto">
              <Pagination className="mb-0">
                <Pagination.Prev
                  disabled={Number(searchParams.get("page") || 1) <= 1}
                  onClick={() =>
                    updatePage(Number(searchParams.get("page") || 1) - 1)
                  }
                />
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={
                        pageNumber === Number(searchParams.get("page") || 1)
                      }
                      onClick={() => updatePage(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  disabled={Number(searchParams.get("page") || 1) >= totalPages}
                  onClick={() =>
                    updatePage(Number(searchParams.get("page") || 1) + 1)
                  }
                />
              </Pagination>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
}

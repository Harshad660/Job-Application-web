import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { Application_API_END_POINT } from "../../../utils/constant.js";
// import { fetchApplicants } from "../../../redux/slices/applicationSlice";

const shortListingStatus = ["Accepted", "Rejected"];

function ApplicantsTable() {
  const dispatch = useDispatch();

  // 🔑 Get logged-in user
  const { user } = useSelector((store) => store.auth);

  // 📄 Get applicants
  const { applicants } = useSelector((store) => store.application);

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(
        `${Application_API_END_POINT}/status/${id}/update`,
        { status }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        // dispatch(fetchApplicants()); // refresh if needed
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // ⛔ If user not loaded yet
  if (!user) return null;

  // ✅ Admin / Recruiter check
  const isAdmin =
    user.role === "admin" || user.role === "recruiter";

  return (
    <div className="w-full">
      <Table>
        <TableCaption>A list of your recent applied users</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>

            {isAdmin && (
              <TableHead className="text-right">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {applicants?.applications?.length > 0 ? (
            applicants.applications.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item?.applicant?.fullName || "NA"}</TableCell>
                <TableCell>{item?.applicant?.email || "NA"}</TableCell>
                <TableCell>{item?.applicant?.phoneNumber || "NA"}</TableCell>

                <TableCell className="text-blue-600">
                  {item?.applicant?.profile?.resume ? (
                    <a
                      href={item.applicant.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.applicant.profile.resumeOriginalName}
                    </a>
                  ) : (
                    "NA"
                  )}
                </TableCell>

                <TableCell>
                  {item?.createdAt
                    ? item.createdAt.split("T")[0]
                    : "NA"}
                </TableCell>

                {/* ✅ ADMIN ACTION */}
                {isAdmin && (
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        side="left"
                        align="end"
                        className="w-32"
                      >
                        {shortListingStatus.map((status) => (
                          <div
                            key={status}
                            onMouseDown={() =>
                              statusHandler(status, item._id)
                            }
                            className="cursor-pointer my-2 text-sm hover:text-blue-600"
                          >
                            {status}
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-4">
                No applicants found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ApplicantsTable;

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);

  const [filterJobs, setFilterJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!allAdminJobs) return;

    setLoading(true);

    const filteredJobs = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;

      return job?.company?.name
        ?.toLowerCase()
        .includes(searchJobByText.toLowerCase());
    });

    setFilterJobs(filteredJobs);
    setLoading(false);
  }, [allAdminJobs, searchJobByText]);

  if (loading) {
    return <div className="text-center mt-10">Loading jobs...</div>;
  }

  return (
    <Table>
      <TableCaption>Your posted jobs</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {filterJobs.map((job) => (
          <TableRow key={job._id}>
            <TableCell>{job?.company?.name || "N/A"}</TableCell>
            <TableCell>{job?.title}</TableCell>
            <TableCell>
              {job?.createdAt?.split("T")[0]}
            </TableCell>

            <TableCell className="text-right">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-36">
                  
                  {/* ✅ EDIT COMPANY */}
                  <div
                    onClick={() =>
                      navigate(`/admin/companies/${job.company._id}`)
                    }
                    className="flex gap-2 cursor-pointer hover:text-blue-600"
                  >
                    <Edit2 className="w-4" />
                    Edit
                  </div>

                  {/* ✅ APPLICANTS */}
                  <div
                    onClick={() =>
                      navigate(`/admin/jobs/${job._id}/applicants`)
                    }
                    className="flex gap-2 mt-2 cursor-pointer hover:text-blue-600"
                  >
                    <Eye className="w-4" />
                    Applicants
                  </div>

                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminJobsTable;
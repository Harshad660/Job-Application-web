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
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Company_API_END_POINT } from "../../../utils/constant";

// ✅ Correct Redux import path
import { setCompanies } from "../../../redux/companySlice";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );

  const [filterCompany, setFilterCompany] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔍 Filter logic
  useEffect(() => {
    const filtered = companies?.filter((company) => {
      if (!searchCompanyByText) return true;
      return company?.name
        ?.toLowerCase()
        .includes(searchCompanyByText.toLowerCase());
    });

    setFilterCompany(filtered);
  }, [companies, searchCompanyByText]);

  // 🗑️ Delete company
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?"
    );
    if (!confirmDelete) return;

    try {
      setLoadingId(id);

      const res = await axios.delete(
        `${Company_API_END_POINT}/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        // ✅ Update Redux store
        const updatedCompanies = companies.filter(
          (company) => company._id !== id
        );

        dispatch(setCompanies(updatedCompanies));
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <Table>
        <TableCaption>All Registered Companies</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterCompany?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No companies found ❌
              </TableCell>
            </TableRow>
          ) : (
            filterCompany.map((company) => (
              <TableRow key={company._id}>
                {/* Logo */}
                <TableCell>
                  <Avatar>
                    <AvatarImage src={company.logo} />
                  </Avatar>
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium">
                  {company.name}
                </TableCell>

                {/* Date */}
                <TableCell>
                  {company?.createdAt?.split("T")[0]}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger className="cursor-pointer">
                      <MoreHorizontal />
                    </PopoverTrigger>

                    <PopoverContent className="w-40 space-y-2">
                      {/* 👁️ View */}
                      <div
                        onClick={() =>
                          navigate(`/admin/companies/view/${company._id}`)
                        }
                        className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                      >
                        <Eye className="w-4" />
                        <span>View</span>
                      </div>

                      {/* ✏️ Edit */}
                      <div
                        onClick={() =>
                          navigate(`/admin/companies/${company._id}`)
                        }
                        className="flex items-center gap-2 cursor-pointer hover:text-green-600"
                      >
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                      </div>

                      {/* 🗑️ Delete */}
                      <div
                        onClick={() => handleDelete(company._id)}
                        className={`flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-800 ${
                          loadingId === company._id
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <Trash2 className="w-4" />
                        <span>
                          {loadingId === company._id
                            ? "Deleting..."
                            : "Delete"}
                        </span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
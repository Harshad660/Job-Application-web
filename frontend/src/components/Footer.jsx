import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Job<span className="text-purple-600">Portal</span>
            </h2>
            <p className="text-sm mt-3 leading-relaxed text-gray-600">
              JobPortal helps job seekers connect with verified recruiters and
              apply to opportunities across India with confidence.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-gray-900" to="#">About Us</Link></li>
              <li><Link className="hover:text-gray-900" to="#">Careers</Link></li>
              <li><Link className="hover:text-gray-900" to="#">Contact</Link></li>
            </ul>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Job Seekers
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-gray-900" to="/jobs">Browse Jobs</Link></li>
              <li><Link className="hover:text-gray-900" to="#">Saved Jobs</Link></li>
              <li><Link className="hover:text-gray-900" to="#">Profile</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Recruiters
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-gray-900" to="/admin/jobs">Post a Job</Link></li>
              <li><Link className="hover:text-gray-900" to="/admin/companies">Manage Company</Link></li>
              <li><Link className="hover:text-gray-900" to="#">Pricing</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>

          {/* Legal */}
          <div className="flex gap-6 text-sm">
            <Link to="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900">Terms of Service</Link>
            <Link to="#" className="hover:text-gray-900">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

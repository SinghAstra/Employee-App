import axios from "axios";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import SearchFilter from "../components/SearchFilter";

const AssignTeamPage = ({ employees, setEmployees, teams }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("name");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [newTeam, setNewTeam] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const employeesPerPage = 5;
  const offset = currentPage * employeesPerPage;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const toggleEmployeeSelection = (id) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((empId) => empId !== id)
        : [...prevSelected, id]
    );
  };

  const assignTeam = async () => {
    if (selectedEmployees.length && newTeam) {
      try {
        await axios.put("http://localhost:5000/api/employees/assign-team", {
          employeeIds: selectedEmployees,
          team: newTeam,
        });

        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            selectedEmployees.includes(employee._id)
              ? { ...employee, team: newTeam }
              : employee
          )
        );

        toast.success("Team assigned successfully!");
        setSelectedEmployees([]);
        setNewTeam("");
      } catch (error) {
        toast.error("Failed to assign team. Please try again.");
        console.error("Assignment error:", error);
      }
    } else {
      toast.error("Please select employees and a team");
    }
  };

  const filteredEmployees = employees
    .filter(
      (employee) =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.team.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "name") {
        return a.firstName.localeCompare(b.firstName);
      }
      return a.team.localeCompare(b.team);
    });

  const displayedEmployees = filteredEmployees.slice(
    offset,
    offset + employeesPerPage
  );
  const pageCount = Math.ceil(employees.length / employeesPerPage);

  return (
    <div>
      <h1>Assign Team</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setCurrentPage={setCurrentPage}
        sortType={sortType}
        setSortType={setSortType}
        filteredEmployees={filteredEmployees}
      />
      {selectedEmployees.length > 0 && (
        <div>
          <select value={newTeam} onChange={(e) => setNewTeam(e.target.value)}>
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <button onClick={assignTeam}>Assign Team</button>
        </div>
      )}
      <div>
        {displayedEmployees.map((employee) => (
          <div
            key={employee.id}
            onClick={() => toggleEmployeeSelection(employee._id)}
            style={{
              border: selectedEmployees.includes(employee._id)
                ? "2px solid blue"
                : "1px solid gray",
              padding: "10px",
              margin: "5px",
              cursor: "pointer",
            }}
          >
            {employee.firstName} {employee.lastName}
          </div>
        ))}
      </div>
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        onPageChange={handlePageClick}
        pageCount={pageCount}
        pageRangeDisplayed={5}
        containerClassName={"pagination"}
        activeClassName={"active"}
        forcePage={currentPage}
      />
    </div>
  );
};

export default AssignTeamPage;

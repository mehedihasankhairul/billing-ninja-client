import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useForm } from "react-hook-form";

const Bills = () => {
  const [billingList, setBillingList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  console.log(billingList);

  useEffect(() => {
    refreshBillingList();
  }, [currentPage]);

  // https://honest-goose-72018.herokuapp.com/

  const refreshBillingList = () => {
    axios
      .get(`https://honest-goose-72018.herokuapp.com/billing-list?page=${currentPage}`)
      .then((res) => setBillingList(res.data[0], setTotalPages(res.data[1])))
      .catch((err) => console.log(err));
  };

  // handle add new bill
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setBillingList([data, ...billingList]);
    document.querySelectorAll('[data-dismiss="modal"]').forEach((e) => e.click());

    axios
      .post("https://honest-goose-72018.herokuapp.com/add-billing", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        refreshBillingList();
        console.log(response.data);
        // clear form
        reset();
      })
      .catch((error) => {
        console.log(error.data);
      });
  };

  // handle Edit bill
  const handleEdit = (_id) => {
    axios
      .get(`https://honest-goose-72018.herokuapp.com/update-billing/${_id}`)
      .then((res) => {
        console.log(res.data);
        document.getElementById("edit-billing-id").value = res.data.id;
        document.getElementById("edit-billing-name").value = res.data.name;
      })
      .catch((err) => console.log(err));
  };

  //  Delete billing
  const URI = "https://honest-goose-72018.herokuapp.com/delete-billing";
  const handleDelete = (_id) => {
    axios
      .delete(`${URI}/${_id}`)
      .then((res) => {
        console.log(res.data);
        refreshBillingList();
      })
      .catch((err) => console.log(err));
  };

  // handle Total Paid Amount
  const totalAmount = billingList?.reduce((current, amount) => {
    const billingAmount = parseInt(amount.paidAmount);
    return current + billingAmount;
  }, 0);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      console.log("go next");
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage <= 1) {
      setCurrentPage(currentPage);
    } else {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className={styles.header_menu}>
        <div className={styles.header_content}>
          <img src="https://i.ibb.co/Kmm8L1V/blogo.png" alt="" />
          <p id="totalBill"> Paid Total: {totalAmount} </p>
        </div>
      </div>
      <div className={styles.table_container}>
        <div className={styles.table_area}>
          <h3 className="text-center">Billing Ninja</h3>
          <div className={styles.search_area}>
            <span>
              Billing <input className={styles.search_box} type="text" />
            </span>

            <button type="button" data-toggle="modal" data-target="#exampleModal" className={styles.add_bill}>
              add new bill
            </button>
          </div>

          <table className="table table-hover table-bordered p-5">
            <thead>
              <tr>
                <th scope="col">Billing ID</th>
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Paid Amount</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {billingList?.map((bill, i) => (
                <tr key={i}>
                  <td>{bill._id ? bill._id.substring(18, 24) : "Generating ID..."}</td>
                  <td>{bill.fullName}</td>
                  <td>{bill.email}</td>
                  <td>{bill.phone}</td>
                  <td>{bill.paidAmount}</td>
                  <td>
                    <span onClick={() => handleEdit(bill._id)} className={styles.editBtn}>
                      Edit
                    </span>
                    <span> | </span>
                    <span onClick={() => handleDelete(bill._id)} className={styles.deleteBtn}>
                      Delete
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <nav aria-label="Page navigation example">
            <ul className="pagination">
              {/* <li className="page-item" onClick={() => setCurrentPage(currentPage.length ===   1 - 1)}> */}
              <li className="page-item" onClick={goToPrevPage}>
                <span className="page-link">
                  <span aria-hidden="true">&laquo;</span>
                </span>
              </li>
              {/* set total page on each list */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <li className="page-item" key={i}>
                  <span className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </span>
                </li>
              ))}

              {/* next page */}
              {/* <li className="page-item" onClick={() => setCurrentPage(currentPage + 1)}> */}
              <li className="page-item" onClick={goToNextPage}>
                <span className="page-link">
                  <span aria-hidden="true">&raquo;</span>
                </span>
              </li>
            </ul>
          </nav>
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title" id="exampleModalLabel">
                    Add Your New Bill
                  </h3>
                  <button type="button" className={styles.close_btn} data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Add New bill information */}
                  <div className={styles.login_form_container}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <input
                        id="edit-billing-name"
                        className={styles.input}
                        placeholder="Full Name"
                        {...register("fullName", { required: true })}
                      />
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="Email"
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        {...register("email", { required: true })}
                      />
                      <input
                        type="text"
                        className={styles.input}
                        pattern="^(?:\d{2}([-.])\d{3}\1\d{3}\1\d{3}|\d{11})$"
                        placeholder="Phone Number"
                        {...register("phone", { required: true })}
                      />
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="Paid Amount"
                        {...register("paidAmount", { required: true })}
                      />
                      <button type="submit" className={styles.green_btn}>
                        Submit
                      </button>
                      {errors.exampleRequired && <span>This field is required</span>}
                    </form>
                  </div>

                  {/* Form End */}
                </div>
              </div>
            </div>
          </div>
          {/* Modal End */}
        </div>
      </div>
    </>
  );
};

export default Bills;

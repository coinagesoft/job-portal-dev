"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getInvoices,
  getInvoiceDetails,
} from "@/services/recruiter/recruiterInvoiceService";



const EmployerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("2026-01-01");

  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const response = await getInvoices(fromDate, toDate);

      setInvoices(response || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            <div className="box-filters-job employer-cv-surface-card">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Invoices & Transactions</h3>
                  <span className="font-sm color-text-paragraph-2">
                    Download GST-compliant billing records
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <Link
                    className="btn btn-border btn-sm mr-10 mb-5"
                    href="/employeer/credit-wallet"
                  >
                    Credit Wallet
                  </Link>
                  <Link
                    className="btn btn-default btn-sm mb-5"
                    href="/employeer/buy-credits"
                  >
                    Buy Credits
                  </Link>
                </div>
              </div>
            </div>

            <div className="card-grid-2 hover-up cv-search-candidate-card mt-20">
              <div className="card-block-info pt-20">
                <div className="row align-items-end">
                  <div className="col-md-4 col-sm-12">
                    <label className="form-label mb-5">From</label>
                    <input
                      className="form-control"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 col-sm-12 mt-sm-10">
                    <label className="form-label mb-5">To</label>
                    <input
                      className="form-control"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 col-sm-12 mt-sm-10 text-md-end">
                    <button
                      className="btn btn-border btn-sm mt-20"
                      type="button"
                      onClick={loadInvoices}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-grid-2 hover-up cv-search-candidate-card mt-20">
              <div className="card-block-info pt-20">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Invoice no.</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>GST</th>
                        <th>Total</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7">Loading...</td>
                        </tr>
                      ) : invoices.length === 0 ? (
                        <tr>
                          <td colSpan="7">No invoices found</td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => (
                          <tr key={invoice.invoiceId}>
                            <td>{invoice.invoiceNumber}</td>

                            <td>
                              {new Date(
                                invoice.invoiceDate,
                              ).toLocaleDateString()}
                            </td>

                            <td>{invoice.transactionType}</td>

                            <td>₹{invoice.amount}</td>

                            <td>₹{invoice.gst}</td>

                            <td>
                              <strong>₹{invoice.total}</strong>
                            </td>

                            <td>
                              {invoice.invoiceUrl ? (
                                <button
                                  className="btn btn-border btn-sm"
                                  onClick={async () => {
                                    const invoice = await getInvoiceDetails(
                                      invoice.invoiceId,
                                    );

                                    window.open(invoice.invoiceUrl, "_blank");
                                  }}
                                >
                                  Download PDF
                                </button>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerInvoicesPage;

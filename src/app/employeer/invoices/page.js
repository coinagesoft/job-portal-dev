"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getInvoices,
  downloadInvoicePdf,
} from "@/services/recruiter/recruiterInvoiceService";
import { useToast } from "@/components/Toast";



const EmployerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const showToast = useToast();

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

  const handleDownload = async (invoice) => {
    setDownloadingId(invoice.invoiceId);
    try {
      const result = await downloadInvoicePdf(
        invoice.invoiceId,
        invoice.invoiceNumber,
      );
      if (!result?.success) {
        showToast(result?.message || "Unable to download invoice.", "error");
      }
    } finally {
      setDownloadingId(null);
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
                    Download GST - compliant billing records
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
  onChange={(e) => {
    const newFromDate = e.target.value;
    setFromDate(newFromDate);

    // Ensure To Date is never earlier than From Date
    if (toDate < newFromDate) {
      setToDate(newFromDate);
    }
  }}
/>
                  </div>
                  <div className="col-md-4 col-sm-12 mt-sm-10">
                    <label className="form-label mb-5">To</label>
                   <input
  className="form-control"
  type="date"
  value={toDate}
  min={fromDate}
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
                                  disabled={downloadingId === invoice.invoiceId}
                                  onClick={() => handleDownload(invoice)}
                                >
                                  {downloadingId === invoice.invoiceId
                                    ? "Downloading…"
                                    : "Download PDF"}
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
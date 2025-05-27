import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTestResults,
  fetchTestDetail,
  setType,
  setFilter,
  setPage,
  updateStatus,
  clearTestDetail,
} from "../features/testResult/testResultSlice";
import "../index.css";

const TestResult = () => {
  const dispatch = useDispatch();
  const {
    results,
    loading,
    error,
    currentType,
    currentFilter,
    currentPage,
    totalRecords,
    statusUpdates,
    testDetail,
    detailLoading,
    detailError,
  } = useSelector((state) => state.testResult);

  const [pageSize, setPageSize] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  useEffect(() => {
    setIsTableLoading(true);
    dispatch(
      fetchTestResults({
        type: currentType,
        filter: currentFilter,
        page: currentPage,
        pageSize,
      })
    ).finally(() => {
      setIsTableLoading(false);
    });
  }, [dispatch, currentType, currentFilter, currentPage, pageSize]);

  // Log the results to inspect the structure
  useEffect(() => {
    console.log("Results from fetchTestResults:", results);
  }, [results]);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    dispatch(setPage(1));
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateStatus({ id, status: newStatus }));
  };

  const handleShowDetails = (id) => {
    if (!id) {
      console.error("Cannot fetch details: Test ID is undefined");
      return;
    }
    const adjustedType = currentType === "PGX" ? "PGX" : "Blood";
    console.log("Fetching details for ID:", id, "Type:", adjustedType);
    dispatch(fetchTestDetail({ id, type: adjustedType }));
    setShowDetails(true);
  };

  const handleBack = () => {
    setIsTableLoading(true);
    dispatch(clearTestDetail());
    setShowDetails(false);
    dispatch(
      fetchTestResults({
        type: currentType,
        filter: currentFilter,
        page: currentPage,
        pageSize,
      })
    ).finally(() => {
      setIsTableLoading(false);
    });
  };

  const handleTypeChange = (type) => {
    setIsTableLoading(true);
    dispatch(setType(type));
  };

  const handleFilterChange = (filter) => {
    setIsTableLoading(true);
    dispatch(setFilter(filter));
  };

  const renderSkeletonTable = () => (
    <table className="table table-responsive table-bordered table-striped text-center align-middle small">
      <thead>
        <tr>
          <th>Test ID</th>
          {currentType === "PGX" && <th>Facility</th>}
          <th>Test Date</th>
          <th>Status</th>
          {currentType === "PGX" && currentFilter === "New" && <th>Action</th>}
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(pageSize)].map((_, index) => (
          <tr key={index}>
            {[...Array(getColumnCount())].map((_, cellIndex) => (
              <td key={cellIndex}>
                <div className="skeleton-line" style={{ width: "80%", margin: "0 auto", height: "18px" }}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSkeletonDetailCard = () => (
    <div className="card">
      <div className="card-header bg-primary">
        <h5 className="card-title text-white p-2 text-center mb-0">
          <div className="skeleton-line" style={{ width: "60%", height: "24px", margin: "0 auto" }}></div>
        </h5>
      </div>
      <div className="card-body">
        <div className="accordion p-5">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="accordion-item">
              <h2 className="accordion-header">
                <div className="skeleton-line" style={{ width: "40%", height: "20px", margin: "10px" }}></div>
              </h2>
              <div className="accordion-body">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-line" style={{ width: "80%", height: "18px", margin: "10px 0" }}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    const totalPages = Math.ceil(totalRecords / pageSize) || 1; // Ensure at least 1 page
    const pages = [];

    const adjustedTotalPages =
      currentType === "PGX" && currentFilter === "New"
        ? Math.min(totalPages, 5)
        : totalPages;

    // Prevent navigation to invalid pages
    if (currentPage > adjustedTotalPages) {
      dispatch(setPage(adjustedTotalPages));
      return [];
    }

    pages.push(
      <button
        key="prev"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => dispatch(setPage(Math.max(currentPage - 1, 1)))}
        disabled={currentPage === 1}
      >
        <i className="bi bi-chevron-left"></i>
      </button>
    );

    const pageButtons = [];
    if (adjustedTotalPages <= 7) {
      for (let i = 1; i <= adjustedTotalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pageButtons.push(1, 2, 3, 4, 5, "...", adjustedTotalPages);
      } else if (currentPage >= adjustedTotalPages - 3) {
        pageButtons.push(
          1,
          "...",
          adjustedTotalPages - 4,
          adjustedTotalPages - 3,
          adjustedTotalPages - 2,
          adjustedTotalPages - 1,
          adjustedTotalPages
        );
      } else {
        pageButtons.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          adjustedTotalPages
        );
      }
    }

    for (const page of pageButtons) {
      if (page === "...") {
        pages.push(
          <span
            key={`dots-${Math.random()}`}
            className="mx-2 d-flex align-items-center"
            style={{ height: "32px" }}
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            onClick={() => dispatch(setPage(page))}
            className={`btn btn-sm mx-1 rounded-circle d-flex align-items-center justify-content-center ${
              currentPage === page ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{ width: "32px", height: "32px", padding: "0" }}
            disabled={page > adjustedTotalPages}
          >
            {page}
          </button>
        );
      }
    }

    pages.push(
      <button
        key="next"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() =>
          dispatch(setPage(Math.min(currentPage + 1, adjustedTotalPages)))
        }
        disabled={currentPage >= adjustedTotalPages}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    );

    return pages;
  };

  // Sort results to prioritize updated records (only for PGX)
  const sortedResults = [...results].sort((a, b) => {
    if (currentType === "PGX") {
      const updateA = statusUpdates[a.testId];
      const updateB = statusUpdates[b.testId];
      if (updateA && !updateB) return -1;
      if (!updateA && updateB) return 1;
      if (updateA && updateB) {
        return new Date(updateB.updatedAt) - new Date(updateA.updatedAt);
      }
    }
    return 0;
  });

  // Calculate number of columns for colSpan
  const getColumnCount = () => {
    if (currentType === "PGX" && currentFilter === "New") {
      return 6; // Test ID, Facility, Test Date, Status, Action, Details
    } else if (currentType === "PGX") {
      return 5; // Test ID, Facility, Test Date, Status, Details
    } else {
      return 4; // Test ID, Test Date, Status, Details (no Facility for Blood)
    }
  };

  const renderDetails = () => {
    return (
      <>
        <button className="btn btn-primary mb-3" onClick={handleBack}>
          <i className="fas fa-chevron-left me-2"></i>Back
        </button>
        {detailLoading ? (
          renderSkeletonDetailCard()
        ) : detailError ? (
          <div className="alert alert-danger" role="alert">
            Error: {detailError}
          </div>
        ) : !testDetail || testDetail.status !== "success" ? (
          <div className="text-center">No details available.</div>
        ) : (
          (() => {
            const { data } = testDetail;

            if (currentType === "PGX") {
              const {
                patient_record,
                medication_history,
                clinical_evidence_level,
                clinical_history,
                genetic_summary,
                current_risk_regimen,
                risk_details,
                thrombosis_profile,
                medication_summary,
                medication_report_detail,
              } = data;

              return (
                <>
                  <div className="card">
                    <div className="card-header bg-primary">
                      <h5 className="card-title text-white p-2 text-center mb-0">
                        Test Details - PGX
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="accordion p-5" id="pgxAccordion">
                        {/* Patient Record */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingPatient">
                            <button
                              className="accordion-button"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapsePatient"
                              aria-expanded="true"
                              aria-controls="collapsePatient"
                            >
                              <i className="fas fa-id-badge me-2"></i> Patient Record
                            </button>
                          </h2>
                          <div
                            id="collapsePatient"
                            className="accordion-collapse collapse show"
                            aria-labelledby="headingPatient"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {patient_record ? (
                                <>
                                  <p><strong>Patient ID:</strong> {patient_record.patient_id}</p>
                                  <p><strong>Name:</strong> {patient_record.first_name} {patient_record.last_name}</p>
                                  <p><strong>Email:</strong> {patient_record.email}</p>
                                  <p><strong>Gender:</strong> {patient_record.gender}</p>
                                  <p><strong>Physician:</strong> {patient_record.physician_name}</p>
                                  <p><strong>Address:</strong> {patient_record.address}, {patient_record.city}, {patient_record.state} {patient_record.zip_code}</p>
                                  <p><strong>Insurance Provider:</strong> {patient_record.insurance_provider}</p>
                                  <p><strong>Facility:</strong> {patient_record.facility_name}, {patient_record.facility_address}, {patient_record.facility_city}, {patient_record.facility_state} {patient_record.facility_zipcode}</p>
                                  <p><strong>ICD-10 Codes:</strong> {patient_record.icd_10_codes.join(", ")}</p>
                                </>
                              ) : (
                                <p>No patient record available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medication History */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingMedicationHistory">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseMedicationHistory"
                              aria-expanded="false"
                              aria-controls="collapseMedicationHistory"
                            >
                              <i className="fas fa-pills me-2"></i> Medication History
                            </button>
                          </h2>
                          <div
                            id="collapseMedicationHistory"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingMedicationHistory"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {[...(patient_record?.medications || []), ...(medication_history?.medications || [])].length > 0 ? (
                                [...(patient_record?.medications || []), ...(medication_history?.medications || [])].map((med, index) => (
                                  <p key={index}>
                                    {med.medication_name}<br />
                                    <strong>Frequency:</strong> {med.dosage}
                                  </p>
                                ))
                              ) : (
                                <p>No medication history available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Clinical Evidence Level */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingEvidence">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseEvidence"
                              aria-expanded="false"
                              aria-controls="collapseEvidence"
                            >
                              <i className="fas fa-flask me-2"></i> Clinical Evidence Level
                            </button>
                          </h2>
                          <div
                            id="collapseEvidence"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingEvidence"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {clinical_evidence_level &&
                              (clinical_evidence_level.strong?.description?.length > 0 ||
                                clinical_evidence_level.moderate?.description?.length > 0 ||
                                clinical_evidence_level.emerging?.description?.length > 0) ? (
                                <>
                                  <p><strong>Strong Evidence</strong><br /> {clinical_evidence_level.strong?.description.join(", ") || "None"}</p>
                                  <p><strong>Moderate Evidence</strong><br /> {clinical_evidence_level.moderate?.description.join(", ") || "None"}</p>
                                  <p><strong>Emerging Evidence</strong><br /> {clinical_evidence_level.emerging?.description.join(", ") || "None"}</p>
                                </>
                              ) : (
                                <p>No clinical evidence level available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Clinical History */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingHistory">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseHistory"
                              aria-expanded="false"
                              aria-controls="collapseHistory"
                            >
                              <i className="fas fa-notes-medical me-2"></i> Clinical History
                            </button>
                          </h2>
                          <div
                            id="collapseHistory"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingHistory"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {clinical_history && clinical_history.clinical_and_lifestyle_history?.length > 0 ? (
                                <ul>
                                  {clinical_history.clinical_and_lifestyle_history.map((history, index) => (
                                    <li className="mt-3" key={index}>{history.category}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p>No clinical history available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Genetic Summary */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingGeneticSummary">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseGeneticSummary"
                              aria-expanded="false"
                              aria-controls="collapseGeneticSummary"
                            >
                              <i className="fas fa-dna me-2"></i> Genetic Summary
                            </button>
                          </h2>
                          <div
                            id="collapseGeneticSummary"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingGeneticSummary"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {genetic_summary && genetic_summary.length > 0 ? (
                                genetic_summary.map((gene, index) => (
                                  <p key={index}>
                                    <strong>{gene.gene}:</strong> {gene.result}<br />
                                    <strong>Activity:</strong> {gene.activity}
                                  </p>
                                ))
                              ) : (
                                <p>No genetic summary available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Current Risk Regimen */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingRiskRegimen">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseRiskRegimen"
                              aria-expanded="false"
                              aria-controls="collapseRiskRegimen"
                            >
                              <i className="fas fa-exclamation-triangle me-2"></i> Current Risk Regimen
                            </button>
                          </h2>
                          <div
                            id="collapseRiskRegimen"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingRiskRegimen"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {current_risk_regimen && current_risk_regimen.length > 0 ? (
                                current_risk_regimen.map((risk, index) => (
                                  <p key={index}>
                                    <strong>{risk.medication}:</strong> {risk.risk_cause}<br />
                                    <strong>Risk Score:</strong> {risk.risk_score}<br />
                                    {risk.description}
                                  </p>
                                ))
                              ) : (
                                <p>No current risk regimen available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Risk Details */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingRiskDetails">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseRiskDetails"
                              aria-expanded="false"
                              aria-controls="collapseRiskDetails"
                            >
                              <i className="fas fa-clipboard-list me-2"></i> Risk Details
                            </button>
                          </h2>
                          <div
                            id="collapseRiskDetails"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingRiskDetails"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {risk_details && risk_details.length > 0 ? (
                                <>
                                  <p><strong>Low Risks:</strong></p>
                                  <ul>
                                    {risk_details.filter(risk => risk.risk_category === "Low Risks").length > 0 ? (
                                      risk_details.filter(risk => risk.risk_category === "Low Risks").map((risk, index) => (
                                        <li key={index}>{risk.description}</li>
                                      ))
                                    ) : (
                                      <li>None</li>
                                    )}
                                  </ul>
                                  <p><strong>High Risks:</strong></p>
                                  <ul>
                                    {risk_details.filter(risk => risk.risk_category === "High Risks").length > 0 ? (
                                      risk_details.filter(risk => risk.risk_category === "High Risks").map((risk, index) => (
                                        <li key={index}>{risk.description}</li>
                                      ))
                                    ) : (
                                      <li>None</li>
                                    )}
                                  </ul>
                                </>
                              ) : (
                                <p>No risk details available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Thrombosis Profile */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingThrombosis">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseThrombosis"
                              aria-expanded="false"
                              aria-controls="collapseThrombosis"
                            >
                              <i className="fas fa-heartbeat me-2"></i> Thrombosis Profile
                            </button>
                          </h2>
                          <div
                            id="collapseThrombosis"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingThrombosis"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {thrombosis_profile && thrombosis_profile.length > 0 ? (
                                thrombosis_profile.map((profile, index) => (
                                  <p key={index}>
                                    <strong>{profile.tested_genes}:</strong> {profile.genotype}<br />
                                    <strong>Predicted Phenotype:</strong> {profile.predicted_phenotype}<br />
                                    <strong>Clinical Guidance:</strong> {profile.clinical_guidance}
                                  </p>
                                ))
                              ) : (
                                <p>No thrombosis profile available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medication Summary */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingMedicationSummary">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseMedicationSummary"
                              aria-expanded="false"
                              aria-controls="collapseMedicationSummary"
                            >
                              <i className="fas fa-capsules me-2"></i> Medication Summary
                            </button>
                          </h2>
                          <div
                            id="collapseMedicationSummary"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingMedicationSummary"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {medication_summary && medication_summary.length > 0 ? (
                                medication_summary.map((med, index) => (
                                  <p key={index}>
                                    <strong>{med.category}</strong><br />
                                    {med.medication_name}<br />
                                    <strong>Therapeutic Class:</strong> {med.therapeutic_class}<br />
                                    <strong>Status:</strong> {med.medication_status}
                                  </p>
                                ))
                              ) : (
                                <p>No medication summary available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medication Report Detail */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingMedReport">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseMedReport"
                              aria-expanded="false"
                              aria-controls="collapseMedReport"
                            >
                              <i className="fas fa-file-medical-alt me-2"></i> Medication Report Detail
                            </button>
                          </h2>
                          <div
                            id="collapseMedReport"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingMedReport"
                            data-bs-parent="#pgxAccordion"
                          >
                            <div className="accordion-body">
                              {medication_report_detail && medication_report_detail.length > 0 ? (
                                medication_report_detail.map((report, index) => (
                                  <p key={index}>
                                    <strong>{report.drug}:</strong> {report.response}<br />
                                    <strong>Finding:</strong> {report.finding}<br />
                                    <strong>Recommendation:</strong> {report.recommendation}<br />
                                    <strong>Concern:</strong> {report.concern}<br />
                                    <strong>Evidence:</strong> {report.evidence}
                                  </p>
                                ))
                              ) : (
                                <p>No medication report detail available.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted text-start p-2 mt-3">
                    This report is for informational purposes only and should not be considered medical advice. Please consult your healthcare provider for personalized guidance.
                  </p>
                </>
              );
            } else if (currentType === "Blood") {
              const { patient_record, report } = data;

              return (
                <>
                  <div className="card">
                    <div className="card-header bg-primary">
                      <h5 className="card-title text-white text-center p-2 mb-0">
                        Test Details - Blood
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="accordion p-5" id="bloodAccordion">
                        {/* Patient Record */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingPatient">
                            <button
                              className="accordion-button"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapsePatient"
                              aria-expanded="true"
                              aria-controls="collapsePatient"
                            >
                              <i className="fas fa-id-badge me-2"></i> Patient Record
                            </button>
                          </h2>
                          <div
                            id="collapsePatient"
                            className="accordion-collapse collapse show"
                            aria-labelledby="headingPatient"
                            data-bs-parent="#bloodAccordion"
                          >
                            <div className="accordion-body">
                              {patient_record ? (
                                <>
                                  <p><strong>Patient ID:</strong> {patient_record.PatientId}</p>
                                  <p><strong>Name:</strong> {patient_record.FirstName}</p>
                                  <p><strong>Email:</strong> {patient_record.Email}</p>
                                  <p><strong>Gender:</strong> {patient_record.Gender}</p>
                                  <p><strong>Date of Birth:</strong> {new Date(patient_record.DOB).toLocaleDateString()}</p>
                                  <p><strong>Address:</strong> {patient_record.Address}, {patient_record.State}</p>
                                  <p><strong>Facility Address:</strong> {patient_record.FacilityAddress}</p>
                                  <p><strong>NPI:</strong> {patient_record.NPI}</p>
                                  <p><strong>Specimen Type:</strong> {patient_record.SpecimenType}</p>
                                  <p><strong>ICD-10 Code:</strong> {patient_record.ICD10Code}</p>
                                  <p><strong>Collector Name:</strong> {patient_record.CollectorName}</p>
                                  <p><strong>Collected By:</strong> {patient_record.CollectedBy}</p>
                                  <p><strong>Ethnicity:</strong> {patient_record.Ethnicity}</p>
                                  <p><strong>Reference Lab:</strong> {patient_record.ReferenceLab}</p>
                                  <p><strong>Date Reported:</strong> {new Date(patient_record.DateReported).toLocaleDateString()}</p>
                                  <p><strong>Fasting:</strong> {patient_record.Fasting}</p>
                                </>
                              ) : (
                                <p>No patient record available.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Test Report */}
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingReport">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseReport"
                              aria-expanded="false"
                              aria-controls="collapseReport"
                            >
                              <i className="fas fa-vials me-2"></i> Test Report
                            </button>
                          </h2>
                          <div
                            id="collapseReport"
                            className="accordion-collapse collapse"
                            aria-labelledby="headingReport"
                            data-bs-parent="#bloodAccordion"
                          >
                            <div className="accordion-body">
                              {report && report.length > 0 ? (
                                <table className="table table-responsive table-bordered table-striped text-center align-middle small">
                                  <thead>
                                    <tr>
                                      <th>Panel</th>
                                      <th>Test</th>
                                      <th>Result</th>
                                      <th>Unit</th>
                                      <th>Reference</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.map((item, index) => (
                                      <tr key={index}>
                                        <td>{item.Panel}</td>
                                        <td>{item.Test}</td>
                                        <td>{item.Result}</td>
                                        <td>{item.Unit}</td>
                                        <td>{item.Reference}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p>No test report available.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted text-start p-2 mt-3">
                    This report is for informational purposes only and should not be considered medical advice. Please consult your healthcare provider for personalized guidance.
                  </p>
                </>
              );
            }

            return <div className="text-center">Unsupported test type.</div>;
          })()
        )}
      </>
    );
  };

  return (
    <div className="container mt-4">
      {showDetails ? (
        renderDetails()
      ) : (
        <>
          {/* Type Buttons */}
          <div className="text-center mb-3">
            <div className="btn-group">
              <button
                className={`btn btn-${
                  currentType === "PGX" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleTypeChange("PGX")}
              >
                PGX
              </button>
              <button
                className={`btn btn-${
                  currentType === "Blood" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleTypeChange("Blood")}
              >
                Blood
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="text-center mb-4">
            <div className="btn-group">
              <button
                className={`btn btn-${
                  currentFilter === "all" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleFilterChange("all")}
              >
                All
              </button>
              <button
                className={`btn btn-${
                  currentFilter === "Approved" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleFilterChange("Approved")}
              >
                Approved
              </button>
              <button
                className={`btn btn-${
                  currentFilter === "New" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleFilterChange("New")}
              >
                New
              </button>
              <button
                className={`btn btn-${
                  currentFilter === "Rejected" ? "primary" : "outline-primary"
                }`}
                onClick={() => handleFilterChange("Rejected")}
              >
                Rejected
              </button>
            </div>
          </div>
          {/* Table */}
          {isTableLoading || loading ? (
            <>
              {renderSkeletonTable()}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex justify-content-center flex-wrap">
                  {renderPagination()}
                </div>
                <div>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="form-select form-select-sm d-inline w-auto"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
              </div>
            </>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              Error: {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}
            </div>
          ) : (
            <>
              <table className="table table-responsive table-bordered table-striped text-center align-middle small">
                <thead>
                  <tr>
                    <th>Test ID</th>
                    {currentType === "PGX" && <th>Facility</th>}
                    <th>Test Date</th>
                    <th>Status</th>
                    {currentType === "PGX" && currentFilter === "New" && <th>Action</th>}
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.length === 0 ? (
                    <tr>
                      <td colSpan={getColumnCount()}>No results found.</td>
                    </tr>
                  ) : (
                    sortedResults.map((result) => {
                      // Determine the status to display
                      let updatedStatus;
                      if (currentType === "Blood") {
                        updatedStatus = result.status;
                      } else if (statusUpdates[result.testId]) {
                        updatedStatus = statusUpdates[result.testId].status;
                      } else if (currentType === "PGX" && currentFilter === "New") {
                        updatedStatus = result.status;
                      } else if (currentType === "PGX" && currentFilter === "all") {
                        updatedStatus = result.rejected ? "Rejected" : "Approved";
                      } else if (
                        currentType === "PGX" &&
                        currentFilter === "Approved"
                      ) {
                        updatedStatus = "Approved";
                      } else if (
                        currentType === "PGX" &&
                        currentFilter === "Rejected"
                      ) {
                        updatedStatus = "Rejected";
                      }

                      // Filter records based on status for PGX "Approved" and "Rejected" filters
                      if (
                        currentType === "PGX" &&
                        currentFilter === "Approved" &&
                        updatedStatus !== "Approved"
                      ) {
                        return null;
                      }
                      if (
                        currentType === "PGX" &&
                        currentFilter === "Rejected" &&
                        updatedStatus !== "Rejected"
                      ) {
                        return null;
                      }

                      return (
                        <tr key={result.testId}>
                          <td>{result.testId}</td>
                          {currentType === "PGX" && <td>{result.facilityName}</td>}
                          <td>{new Date(result.testDate).toLocaleString()}</td>
                          <td
                            className={
                              updatedStatus === "Rejected"
                                ? "text-danger fw-bold"
                                : updatedStatus === "Approved"
                                ? "text-success fw-bold"
                                : updatedStatus === "UnApproved" && // Displaying UnApproved status in danger color
                                  currentType === "PGX" &&
                                  currentFilter === "New"
                                ? "text-danger fw-bold"
                                : ""
                            }
                          >
                            {updatedStatus}
                          </td>
                          {currentType === "PGX" && currentFilter === "New" && (
                            <td className="text-center">
                              {!statusUpdates[result.testId] && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() =>
                                      handleStatusChange(result.testId, "Approved")
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      handleStatusChange(result.testId, "Rejected")
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          )}
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-primary border rounded-5"
                              onClick={() => handleShowDetails(result.testId)}
                            >
                              <i className="fas fa-info-circle mt-1"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination & Page Size */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex justify-content-center flex-wrap">
                  {renderPagination()}
                </div>
                <div>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="form-select form-select-sm d-inline w-auto"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TestResult;
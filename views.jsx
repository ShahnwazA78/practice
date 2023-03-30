import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  currentAWERightSidebarType,
  currentAWERightSidebar,
} from "../../store/actions";
import AWVApi from "../../assets/constants/AWVRafservice.Instance";
import Tooltip from "@mui/material/Tooltip";
import CancelIcon from "@mui/icons-material/Cancel";
import Divider from "@mui/material/Divider";
import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import pdfIcon from "../../assets/images/pdf_icon.png";
import Moment from "moment";
import Button from "@material-ui/core/Button";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Typography from "@material-ui/core/Typography";
import { CircularProgress } from "@material-ui/core";
import axios from "axios";
import AWS from "aws-sdk";
import { convertToPacificTime } from "../../assets/constants/customRender";
const aws = require("aws-sdk");

const S3_BUCKET = process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET;
const REGION = process.env.REACT_APP_REGION;
const ACCESS_KEY = process.env.REACT_APP_ACCESS_ID;
const SECRET_ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY;

const ViewAWVFileUpload = (props) => {
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
  } = useForm();
  const [fileUrl, setFileUrl] = useState();
  const [fileName, setFileName] = useState();

  useEffect(() => {
    editLoadFormData(props.AwvId);
  }, [props.AwvId]);

  useEffect(() => {
    if (editFormData?.form_url && editFormData?.form_url != "") {
      aws.config.update({
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: REGION,
      });
      const s3d = new aws.S3();
      var credentials = {
        accessKeyId: process.env.REACT_APP_ACCESS_ID,
        secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
      };
      AWS.config.update({
        credentials: credentials,
        region: process.env.REACT_APP_REGION,
        signatureVersion: "v4",
      });
      var s3 = new AWS.S3({
        signatureVersion: "v4",
      });

      //let Key = 'test.pdf';
      let url = editFormData?.form_url;
      let Key = url.split("/").pop();

      var keyWithSubString = "";
      //setFileName(Key);

      s3.setupRequestListeners = (request) => {
        request.on("build", (req) => {
          req.httpRequest.headers["x-amz-date"] = process.env.REACT_APP_KeyID;
        });
      };
      let fileKey = "awv-form-upload/" + Key;

      var presignedGETURL = s3.getSignedUrl("getObject", {
        Bucket: S3_BUCKET,
        Key: fileKey,
        Expires: 60,
      });
      if (Key.includes("/")) {
        keyWithSubString = Key.substr(Key.lastIndexOf("/"));
      } else {
        keyWithSubString = Key;
      }
      axios({
        url: presignedGETURL,
        responseType: "arraybuffer",
        method: "GET",
      })
        .then((res) => {
          let file = new Blob([res.data], {
            type: "application/pdf",
          });

          let fileURL = URL.createObjectURL(file);
          setFileUrl(presignedGETURL);
        })
        .catch((err) => {
          console.log("Error while downloading file...");
        });
    }
  }, [editFormData?.form_url]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const editLoadFormData = (value) => {
    setIsLoading(true);
    AWVApi.get(
      "/get-all-awv-record?payment_year=" +
        props.yearSelect +
        "&organisation_id=1&lob=" +
        props.lobSelect +
        "&awvId=" +
        value +
        "&iSortCol_0=provider_group&sSortDir_0=asc&iDisplayStart=0&iDisplayLength=1&formAttached=0"
    )
      .then((res) => {
        if (res.data && res.data[0]) {
            
          setEditFormData(res.data[0]);

          setIsLoading(false);
        } else {
          setEditFormData();
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div style={{ padding: "10px 0px" }}>
      <div
        key={"index"}
        variant={"head"}
        style={{ width: "350px", padding: "10px", height: "50px" }}
      >
        <div class="float">
          <div class="float-left">
            <span>
              <b>View </b>
            </span>
          </div>
          <div class="float-right">
            <Tooltip title="Close">
              <CancelIcon
                style={{ color: "#1A9698", cursor: "pointer" }}
                onClick={() => notificationRightDrawer(false)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      <Divider />
      <div class="awv-recored-right-sidebar-form">
        {editFormData?.cin && editFormData?.cin != "" ? (
          <form onSubmit={handleSubmit(onSubmit)} id="add-verification-model">
            <div className="row col-lg-12 align-items-center mt-3 mb-3">
              <div className="col-lg-6">
                <div className="mb-1">
                  <strong>CIN/RXID</strong>
                </div>
                <div>{editFormData?.cin}</div>
              </div>
              <div className="col-lg-6">
                <div className="mb-1">
                  <strong>AWE ID</strong>
                </div>
                <div>{editFormData?.awe_display_id}</div>
              </div>
            </div>
            <div className="row col-lg-12 align-items-center mt-3 mb-3">
              <div className="col-lg-6">
                <div className="mb-1">
                  <strong>UPDATED ON</strong>
                </div>
                <div>
                  {Moment(
                    convertToPacificTime(editFormData?.updated_on)
                  ).format("YYYY-MM-DD")}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-1">
                  <strong>TIME SPENT</strong>
                </div>
                <div>
                  {Moment(convertToPacificTime(editFormData?.updated_on)).diff(
                    Moment(convertToPacificTime(editFormData?.created_on)),
                    "days"
                  ) + " Days"}
                </div>
              </div>
            </div>
            <div
              className="col-lg-12 align-items-center mb-3"
              style={{ width: "300px" }}
            >
              <div className="mb-1">
                <strong>PROGRESS</strong>
              </div>
              <div>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ minWidth: 20 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >{`${Math.round(editFormData?.progress)}%`}</Typography>
                  </Box>
                  <Box sx={{ width: "100%", ml: 1 }}>
                    <Box sx={{ width: "100%", ml: 1 }}>
                      <LinearProgress
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          [`&.${linearProgressClasses.colorPrimary}`]: {
                            backgroundColor: [800],
                          },
                          [`& .${linearProgressClasses.bar}`]: {
                            borderRadius: 5,
                            backgroundColor: "#1a9698",
                          },
                        }}
                        color="primary"
                        variant="determinate"
                        value={editFormData?.progress}
                      />
                    </Box>
                  </Box>
                </Box>
              </div>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>DOCUMENT UPLOADED</strong>
              </div>
              <div className="ml-2">
                {fileUrl &&
                editFormData?.form_url &&
                editFormData?.form_url != "" ? (
                  <>
                    <img
                      src={pdfIcon}
                      alt=""
                      className=""
                      style={{
                        width: "20px",
                        height: "20px",
                        marginLeft: "-7px",
                      }}
                    />
                    <a target="_blank" href={fileUrl}>
                      {editFormData?.form_url
                        ? editFormData?.form_url?.split("/").pop()
                        : ""}
                    </a>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>ASSIGNED TO</strong>
              </div>
              <div>{editFormData?.assignedUserName}</div>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>STATUS</strong>
              </div>
              <div>
                <span className="expand-grid-warning-status pt-1 pb-1 pl-3 pr-3">
                  {editFormData?.form_status}
                </span>
              </div>
            </div>
            {editFormData?.POS ? (
              <div className="col-lg-12 align-items-center mb-3">
                <div className="mb-1">
                  <strong>POS</strong>
                </div>
                <div>{editFormData?.POS}</div>
              </div>
            ) : (
              <></>
            )}
            {editFormData?.reason_code_description ? (
              <div className="col-lg-12 align-items-center mb-3">
                <div className="mb-1">
                  <strong>Reason Code</strong>
                </div>
                <div>{editFormData?.reason_code_description}</div>
              </div>
            ) : (
              <></>
            )}
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>REMARK</strong>
              </div>
              <div>
                {editFormData?.approval_remarks} {editFormData?.rejected_remark}
              </div>
            </div>
            {editFormData?.on_hold_remark ? (
              <div className="col-lg-12 align-items-center mb-3">
                <div className="mb-1">
                  <strong>On Hold Remark</strong>
                </div>
                <div>{editFormData?.on_hold_remark}</div>
              </div>
            ) : (
              <></>
            )}
            <div className="col-lg-12 align-items-center mb-3">
              {/* <div>Last updated by: <span className='txt-custom-primary' style={{ textTransform: 'capitalize' }}>{editFormData?.form_pending_on}</span> <strong>| {editFormData?.updated_on}</strong></div> */}
              {/* removing role and | symbol */}
              <div>
                Last updated on:{" "}
                {/*<span className='txt-custom-primary' style={{ textTransform: 'capitalize' }}>{props?.editFormData?.form_pending_on}</span> */}
                <strong>
                  {Moment(
                    convertToPacificTime(editFormData?.updated_on)
                  ).format("YYYY-MM-DD")}
                </strong>
              </div>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <Button
                type="button"
                variant="contained"
                color="grey"
                onClick={() => notificationRightDrawer(false)}
              >
                CANCEL
              </Button>
            </div>
          </form>
        ) : isLoading ? (
          <div style={{ position: "absolute", top: "50%", left: "50%" }}>
            <CircularProgress />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    yearSelect: state.moduleFilter.yearSelect,
    lobSelect: state.moduleFilter.lobSelect,
    aweRightSidebarType: state.moduleFilter.aweRightSidebarType,
    aweRightSidebar: state.moduleFilter.aweRightSidebar,
  };
};
export default connect(mapStateToProps, {
  currentAWERightSidebarType,
  currentAWERightSidebar,
})(ViewAWVFileUpload);

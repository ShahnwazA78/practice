import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  currentAWERightSidebarType,
  currentAWERightSidebar,
  currentAWERightSidebarCloseDatatableReload,
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
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { styled } from "@mui/material/styles";
import TextField from "@material-ui/core/TextField";
import { toast } from "react-toastify";
import { convertToPacificTime } from "../../assets/constants/customRender";
import axios from "axios";
import AWS from "aws-sdk";
const aws = require("aws-sdk");

const S3_BUCKET = process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET;
const REGION = process.env.REACT_APP_REGION;
const ACCESS_KEY = process.env.REACT_APP_ACCESS_ID;
const SECRET_ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const OnHoldAWVFileUpload = (props) => {
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    register: registerHcc,
    formState: { errors: errorsHcc },
    handleSubmit: handleSubmitHcc,
    reset: resetHcc,
    control: controlHcc,
    setValue: setValueHcc,
  } = useForm();
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
  const [rejectionCodeList, setRejectionCodeList] = useState([]);
  const [onHoldCodeList, setOnHoldCodeList] = useState([]);
  const [editDetailsGridShow, setEditDetailsGridShow] = useState(false);
  const [editHcccDetailsIndex, setEditHcccDetailsIndex] = useState("");
  const [formDataList, setFormDataList] = useState([]);
  const [formSubmitisLoading, setFormSubmitisLoading] = useState(false);

  useEffect(() => {
    editLoadFormData(props.AwvId);
    // loadRejectionCode();
    loadOnHoldCode();
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

  useEffect(() => {
    if (editFormData?.awv_id && editFormData?.awv_id != "") {
      let controlUser = JSON.parse(localStorage.getItem("controlUser"));

      setValue("role", "3");
      setValue("action_status", "4");
      setValue("reason_code", "");
      setValue("awv_id", editFormData?.awv_id);
      //setValue('createdOn', editFormData?.created_on);
      setValue("createdOn", Moment().format("YYYY-MM-DD HH:mm:ss")); // To do  Temp fix. Need to check why time is not coming along with date
      setValue("lob", props?.lobSelect);
      setValue("user_id", controlUser?.user_id);
      setValue("provider_id", controlUser?.user_id);
      setValue("pos_name", editFormData?.POS ? editFormData?.POS : "");
      // setValue('pos_name', ""); // To do check for blank value Temp fix.

      setValue("form_status", (props.aweRightSidebarType?.status).toString());
      setValue("current_form_status", editFormData?.form_status);
      setValue(
        "onhold_reason_code",
        editFormData.onhold_reason_code ? editFormData?.onhold_reason_code : ""
      );
      setValue("cin", editFormData?.cin);
      setValue("member_id", editFormData?.member_id);
      setValue("organisation_id", (editFormData?.organisation_id).toString());
      setValue("payment_year", props.yearSelect);
      setValue("provider_group", editFormData?.provider_group);
      // setValue('onhold_reason_code', "");
      if (editFormData.on_hold && editFormData.on_hold == "Y") {
        setValue("onhold_status", "N");
      } else {
        setValue("onhold_status", "Y");
      }
      // setValue('onhold_status', 'Y'); // implemetion pending
    }
  }, [editFormData]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  // commenting this code- rejection reason codes are not used for onhold
  /* const loadRejectionCode = () => {
        AWVApi.get('/get_rejection_code')
            .then(res => {
                setRejectionCodeList(res.data);
                // console.log(res.data);
            })
            .catch(err => {
                // console.log(err);
            })
    } */
  // created funtion to call onhold data
  const loadOnHoldCode = () => {
    AWVApi.get("/get_onhold_reason_code")
      .then((res) => {
        setOnHoldCodeList(res.data);
        //alert(res.data);
      })
      .catch((err) => {
        //console.log(err);
      });
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
        console.log(res.data);
        if (res.data && res.data[0]) {
          setEditFormData(res.data[0]);
          setEditDetailsGridShow(false);
          setEditHcccDetailsIndex("");
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

  const loadEditDetails = (event) => {
    setEditDetailsGridShow(!editDetailsGridShow);
  };

  const onSubmit = (data) => {
    if (editFormData?.awv_id && editFormData?.awv_id != "") {
      setFormSubmitisLoading(true);
      data.awvId = data.awv_id.toString();
      //data.createdOn = data.createdOn.toString();
      console.log("data");
      AWVApi.post("/create-awv-remark-record", data)
        .then((res) => {
          setValue("remark", "");
          setValue("action_status", "");
          setValue("awvid", "");
          setValue("createdOn", "");
          setValue("lob", "");
          setValue("user_id", "");
          setValue("role", "");
          setValue("reason_code", "");
          setValue("current_form_status", "");
          setFormSubmitisLoading(false);
          if (editFormData.on_hold && editFormData.on_hold == "Y") {
            toast.success("Un Hold remark added successfully");
          } else {
            toast.success("On Hold remark added successfully");
          }

          props.currentAWERightSidebarCloseDatatableReload(true);
          notificationRightDrawer(false);
        })
        .catch((err) => {
          setFormSubmitisLoading(false);
          toast.error(err?.response?.data?.message);
        });
    }
    // else {
    //     adminApi.post('/module', data)
    //         .then(res => {
    //             props.handleClose();
    //             setValue('id', '');
    //             setValue('title', '');
    //             setValue('description', '');
    //             setValue('status', '1');
    //             setStatusCheck('1');
    //             props.loadFormData();
    //             setIsLoading(false);
    //         })
    //         .catch(err => {
    //             setIsLoading(false);
    //             toast.error(err?.response?.data?.message);
    //         })
    // }
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
              <b>
                {editFormData.on_hold && editFormData.on_hold == "Y"
                  ? "Un Hold"
                  : "HOLD"}
              </b>
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
                  {Moment(editFormData?.updated_on).diff(
                    Moment(editFormData?.created_on),
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
            {/* get data from onhold funtion and showing to the user; */}
            {!editFormData.on_hold || editFormData.on_hold !== "Y" ? (
              <div className="col-lg-12 align-items-center mb-3">
                <div className="mb-1">
                  <strong>REASON CODE</strong>
                </div>
                <FormControl style={{ width: "20rem" }}>
                  <Controller
                    className="input-control"
                    name="onhold_reason_code"
                    value={editFormData?.onhold_reason_code}
                    control={control}
                    render={({ field }) => (
                      // <TextField  {...field} variant="outlined" />
                      <Select
                        {...field}
                        labelId="module-multiple-checkbox-label"
                        id="module-multiple-checkbox"
                        variant="outlined"
                        menuPlacement="top"
                        displayEmpty
                        defaultValue=""
                      >
                        <MenuItem value="">Select</MenuItem>
                        {onHoldCodeList &&
                          onHoldCodeList.length > 0 &&
                          onHoldCodeList.map((element, index) => (
                            <MenuItem key={index} value={element.id}>
                              {element.onhold_reason_code_description}
                            </MenuItem>
                          ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>
            ) : (
              <></>
            )}

            <div className="col-lg-12 align-items-center mb-3">
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "100px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="remark"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      multiline
                      rows={3}
                      {...field}
                      label="Remark"
                      variant="outlined"
                    />
                  )}
                  rules={{
                    required: false,
                  }}
                />
                {errors?.remark?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 mt-3 mb-3">
              {/* {(editFormData?.form_status && editFormData?.form_status == 'pendingforCoder') ?
                                <>
                                    <Button type='button' onClick={loadEditDetails} className="ml-2 mr-2 btn-custom-primary" variant="contained">
                                        View HCC Details
                                    </Button>
                                </>
                                :
                                <></>
                            } */}
              <Button
                type="button"
                variant="contained"
                color="grey"
                onClick={() => notificationRightDrawer(false)}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                className={"mr-2 ml-2 btn-custom-primary"}
                variant="contained"
                disabled={
                  formSubmitisLoading && formSubmitisLoading == true
                    ? true
                    : false
                }
              >
                Submit
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
  currentAWERightSidebarCloseDatatableReload,
})(OnHoldAWVFileUpload);

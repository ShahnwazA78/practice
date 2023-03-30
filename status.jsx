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
import { convertToPacificTime } from "../../assets/constants/customRender";
import { styled } from "@mui/material/styles";
import TextField from "@material-ui/core/TextField";
import { toast } from "react-toastify";
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

const StatusAWVFileUpload = (props) => {
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
  const [editDetailsGridShow, setEditDetailsGridShow] = useState(false);
  const [editHcccDetailsIndex, setEditHcccDetailsIndex] = useState("");
  const [formDataList, setFormDataList] = useState([]);
  const [formSubmitisLoading, setFormSubmitisLoading] = useState(false);

  useEffect(() => {
    editLoadFormData(props.AwvId);
    loadRejectionCode();
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

      if (
        props.aweRightSidebarType?.status &&
        (props.aweRightSidebarType?.status == "7" ||
          props.aweRightSidebarType?.status == "2")
      ) {
        setValue("action_status", 2);
        setValue("role", 2);
      } else {
        setValue("action_status", 1);
        if (props.modelFormRole && props.modelFormRole != "") {
          setValue("role", props.modelFormRole);
        } else {
          setValue("role", 1);
        }
      }

      setValue("reason_code", "");
      setValue("awv_id", editFormData?.awv_id);
      setValue("createdOn", editFormData?.created_on);
      setValue("lob", props?.lobSelect);
      setValue("user_id", controlUser?.user_id);
      setValue("provider_id", controlUser?.user_id);
      setValue("pos_name", editFormData?.POS);
      setValue("form_status", props.aweRightSidebarType?.status);
      setValue("cin", editFormData?.cin);
      setValue("member_id", editFormData?.member_id);
      setValue("organisation_id", (editFormData?.organisation_id).toString());
      setValue("payment_year", props.yearSelect);
      setValue("provider_group", editFormData?.provider_group);

      setValue("onhold_status", "N"); // implemetion pending
    }
  }, [editFormData]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const loadRejectionCode = () => {
    AWVApi.get("/get_rejection_code")
      .then((res) => {
        setRejectionCodeList(res.data);
        // console.log(res.data);
      })
      .catch((err) => {
        // console.log(err);
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
      if (data.pos_name == null) data.pos_name = "";
      if (data.form_status == 7) data.action_status = "3";
      else data.action_status = data.action_status.toString();

      data.form_status = data.form_status.toString();
      data.current_form_status = editFormData?.form_status;
      /*
            if (props.aweRightSidebarType?.status == 7) {
                data.form_status = '1';

            }*/
      if (props.aweRightSidebarType?.status == 2) {
        data.form_status = "3";
      }

      if (data.form_status == 2 || data.form_status == 3) {
        data.role = "4";
      } else {
        data.role = data.role.toString();
      }
      console.log("data");
      console.log(data);
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
          setFormSubmitisLoading(false);
          toast.success("Remarks added successfully");
          notificationRightDrawer(false);
          props.currentAWERightSidebarCloseDatatableReload(true);
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
                {props.aweRightSidebarType?.status &&
                props.aweRightSidebarType?.status == 7
                  ? "MARK AS VOID"
                  : props.aweRightSidebarType?.status &&
                    props.aweRightSidebarType?.status == 2
                  ? "REJECT"
                  : "APPROVE"}
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
            <div className="col-lg-12 align-items-center mb-3">
              {((editFormData?.form_status &&
                editFormData?.form_status == "pendingforCoordinator") ||
                editFormData.form_stage == "2") &&
              props.aweRightSidebarType?.status &&
              props.aweRightSidebarType?.status != 2 &&
              props.aweRightSidebarType?.status != 7 ? (
                <div>
                  <div className="mb-1">
                    <strong>PLACE OF SERVICE</strong>
                  </div>
                  {/* <InputLabel id="demo-simple-select-outlined-label"><b>PLACE OF SERVICE</b></InputLabel> */}
                  <FormControl fullWidth>
                    <Controller
                      className="input-control"
                      name="pos_name"
                      value={editFormData?.POS}
                      control={control}
                      rules={{
                        required: true, // add the required field
                      }}
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
                          <MenuItem value={"In Home Assessment"}>
                            In Home Assessment
                          </MenuItem>
                          <MenuItem value={"Office Visit"}>
                            Office Visit
                          </MenuItem>
                          <MenuItem value={"TeleHealth"}>Tele Health</MenuItem>
                        </Select>
                      )}
                    />
                    {errors?.pos_name?.type === "required" && (
                      <label className="text-danger">
                        This field is required
                      </label>
                    )}
                  </FormControl>
                </div>
              ) : editFormData?.POS && editFormData?.POS != "" ? (
                <div>
                  <div className="mb-1">
                    <strong>PLACE OF SERVICE</strong>
                  </div>
                  <div>{editFormData?.POS}</div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {props.aweRightSidebarType?.status &&
            props.aweRightSidebarType?.status == 2 ? (
              <div className="col-lg-12 align-items-center mb-3">
                <div className="mb-1">
                  <strong>REASON CODE</strong>
                </div>
                <FormControl fullWidth>
                  <Controller
                    className="input-control"
                    name="reason_code"
                    value={editFormData?.reason_code}
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
                        {rejectionCodeList &&
                          rejectionCodeList.length > 0 &&
                          rejectionCodeList.map((element, index) => (
                            <MenuItem
                              key={index}
                              value={element.reason_code_id}
                            >
                              {element.reason_code_description}
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
                      label="REMARK"
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
            {editDetailsGridShow ? (
              <div className="col-lg-12 align-items-center mt-3 mb-5">
                <div className="card m-3">
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell align="center">
                            HCC Code
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            HCC Description
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            DX Code
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            DX Description
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            HCC Confirmed
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            Remarks
                          </StyledTableCell>
                          {/* <StyledTableCell align="center">Action</StyledTableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formDataList.map((row, index) => (
                          <StyledTableRow key={index}>
                            {editHcccDetailsIndex &&
                            editHcccDetailsIndex == index + 1 ? (
                              <>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"HCC_Code"}
                                    value={row.HCC_Code}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="number"
                                        variant="outlined"
                                      />
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"HCC_Description"}
                                    value={row.HCC_Description}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="text"
                                        variant="outlined"
                                      />
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"DX_code"}
                                    value={row.DX_code}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="text"
                                        variant="outlined"
                                      />
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"DX_description"}
                                    value={row.DX_description}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="text"
                                        variant="outlined"
                                      />
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"HCC_Confirmed"}
                                    value={row.HCC_Confirmed}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        labelId="module-multiple-checkbox-label"
                                        id="module-multiple-checkbox"
                                        // value={selectModule}
                                        // onChange={handleChange}
                                        label="Module"
                                        variant="outlined"
                                        // MenuProps={MenuProps}
                                        menuPlacement="top"
                                      >
                                        <MenuItem
                                          key={"confirmed"}
                                          value={"confirmed"}
                                        >
                                          Confirmed
                                        </MenuItem>
                                        <MenuItem
                                          key={"not confirmed"}
                                          value={"not confirmed"}
                                        >
                                          Not Confirmed
                                        </MenuItem>
                                        <MenuItem
                                          key={"no longer applicable"}
                                          value={"no longer applicable"}
                                        >
                                          No Longer Applicable
                                        </MenuItem>
                                      </Select>
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Controller
                                    className="input-control"
                                    name={"remark"}
                                    value={row.remark}
                                    control={controlHcc}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type="text"
                                        variant="outlined"
                                      />
                                    )}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Button
                                    type="submit"
                                    className={
                                      props.modelStatus &&
                                      props.modelStatus == true
                                        ? "mr-2 btn-custom-danger"
                                        : "mr-2 btn-custom-primary"
                                    }
                                    variant="contained"
                                    disabled={
                                      isLoading && isLoading == true
                                        ? true
                                        : false
                                    }
                                  >
                                    Submit
                                  </Button>
                                </StyledTableCell>
                              </>
                            ) : (
                              <>
                                <StyledTableCell align="center">
                                  {row.HCC_Code}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {row.HCC_Description}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {row.DX_code}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {row.DX_description}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {row.HCC_Confirmed}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {row.remark}
                                </StyledTableCell>
                                {/* <StyledTableCell align="center">
                                                                            <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => editHCCActionData(row, (index + 1))}>EDIT</span> 
                                                                        </StyledTableCell> */}
                              </>
                            )}
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            ) : (
              <></>
            )}
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
                className={
                  props.aweRightSidebarType?.status &&
                  (props.aweRightSidebarType?.status == 7 ||
                    props.aweRightSidebarType?.status == 2)
                    ? "mr-2 ml-2 btn-custom-danger"
                    : "mr-2 ml-2 btn-custom-primary"
                }
                variant="contained"
                disabled={
                  formSubmitisLoading && formSubmitisLoading == true
                    ? true
                    : false
                }
              >
                {props.aweRightSidebarType?.status &&
                props.aweRightSidebarType?.status == 7
                  ? "MARK AS VOID"
                  : props.aweRightSidebarType?.status &&
                    props.aweRightSidebarType?.status == 2
                  ? "REJECT"
                  : "APPROVE"}
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
})(StatusAWVFileUpload);

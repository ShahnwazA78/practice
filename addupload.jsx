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
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import S3 from "react-aws-s3";
import { toast } from "react-toastify";
import { string } from "i/lib/util";

var AWS = require("aws-sdk");

const S3_BUCKET = process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET;
const REGION = process.env.REACT_APP_REGION;
const ACCESS_KEY = process.env.REACT_APP_ACCESS_ID;
const SECRET_ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY;

const AddAWVFileUpload = (props) => {
  const fileInput = React.useRef();
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
  const [formFileUrl, setFormFileUrl] = useState();
  const [formSubmitisLoading, setFormSubmitisLoading] = useState(false);

  const config = {
    bucketName: process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET,
    //bucketName: 'bucket-awv-form-upload', //process.env.REACT_APP_BUCKET_NAME_Two,
    // dirName: 'bucket-awv-report',
    region: process.env.REACT_APP_REGION,
    accessKeyId: process.env.REACT_APP_ACCESS_ID,
    secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
    s3Url:
      "https://rj3vuo7d30.execute-api.us-east-1.amazonaws.com/v1/upload-form",
  };

  const ReactS3Client = new S3(config);

  useEffect(() => {
    editLoadFormData(props.AwvId);
  }, [props.AwvId]);

  useEffect(() => {
    if (editFormData?.awv_id && editFormData?.awv_id != "") {
      let controlUser = JSON.parse(localStorage.getItem("controlUser"));
      if (editFormData && editFormData?.awv_id) {
        setValue("cin", editFormData?.cin);
        setValue("awv_id", (editFormData?.awv_id).toString());
        setValue("form_url", "");
        setValue("updated_by", controlUser?.user_id);
        setValue("remark", "");
        setValue("lob", props?.lobSelect);
        setValue("file_upload", "");
        setValue("form_url", "");
        setValue("onhold_status", "Y");
      } else {
        setValue("cin", "");
        setValue("awv_id", "");
        setValue("form_url", "");
        setValue("updated_by", "");
        setValue("remark", "");
        setValue("file_upload", "");
        setValue("form_url", "");
        setValue("onhold_status", "Y");
      }
      setFileName("");
      setFormFileUrl("");
    }
  }, [editFormData]);

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

  // Delacaring date with formate mm-DD-yyyy
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString()
  );
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  var date = currentDate.split("/");
  var newDate =
    date[0].toString().padStart(2, "0") +
    "-" +
    date[1].toString().padStart(2, "0") +
    "-" +
    date[2];

  const handleFileUpload = (event) => {
    setValue("file_upload", event.target.value);
    setFileName(fileInput?.current?.files[0]?.name);

    var file_name =
      "https://bgguzqqgp5.execute-api.us-east-1.amazonaws.com/v1/bucket-member-details/AWE_2022_v3.pdf"; //+ editFormData?.awv_id +'.pdf';
    var api_url =
      "https://rj3vuo7d30.execute-api.us-east-1.amazonaws.com/v1/upload-form";

    if (
      fileInput?.current &&
      fileInput?.current?.files &&
      fileInput?.current?.files[0]
    ) {
      const headers = {
        "Content-Type": "application/pdf",
      };

      var path =
        process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET + "/awv-form-upload";

      AWS.config.update({
        region: REGION,
        credentials: new AWS.Credentials(ACCESS_KEY, SECRET_ACCESS_KEY),
      });
      var file = fileInput?.current?.files[0]; //file?.name
      // changes perform on filename and validate the filename {blank space replace with underscore & through regex we test any Special character present in the filename or not if present then restrict to pass }
      var exa_fileName = fileInput?.current?.files[0]?.name.replaceAll(
        " ",
        "_"
      );
      exa_fileName = exa_fileName.slice(0, exa_fileName.lastIndexOf("."));
      const regex = /^[a-zA-Z0-9_.-]+$/;
      if (!regex.test(exa_fileName) || exa_fileName.includes(".")) {
        setFileName("");
        setFormFileUrl("");
        setValue("file_upload", "");
        return toast.error(
          "File name contains special characters is not uploading"
        );
      }
      // here we attach the timestamp formate of (DD-MM-YY) ;
      var fileKey = exa_fileName + "_" + newDate + ".pdf";
      let upload_params = {
        Bucket: path,
        Key: fileKey,
        Body: file,
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: process.env.REACT_APP_KeyID,
        ContentDisposition: "inline",
        ContentType: "application/pdf",
      };
      let upload = new AWS.S3.ManagedUpload({ params: upload_params });
      upload.promise(function (err, data) {
        //window.alert("FILE UPLOADED SUCCESSFULLY data ",data.Location," ERRO  ",err );
        setFormFileUrl(data.Location);
        setValue("form_url", data.Location);
        var formUrl = data.Location;
        var s3 = new AWS.S3({ signatureVersion: "v4" });
        //let Key = fileKey;
        let Key = "awv-form-upload/" + fileKey;

        s3.setupRequestListeners = (request) => {
          request.on("build", (req) => {
            req.httpRequest.headers["x-amz-date"] = process.env.REACT_APP_KeyID;
          });
        };
        var presignedGETURL = s3.getSignedUrl("getObject", {
          Bucket: process.env.REACT_APP_AWE_FILE_UPLOAD_BUCKET, // S3_BUCKET, //bucket-demo-data-repository
          Key: Key,
          Expires: 60,
        });
        setFormFileUrl(presignedGETURL);
      });
    }
  };

  const onSubmit = (data) => {
    //event.preventDefault();
    if (editFormData?.awv_id && editFormData?.awv_id != "") {
      setFormSubmitisLoading(true);
      // console.log(data);
      data.form_url = getValues("form_url");
      data.updated_on = Moment().format("YYYY-MM-DD HH:mm:ss");
      AWVApi.put(
        "/update-awv-form-url?awv_id=" +
          data?.awv_id +
          "&form_url=&updated_by=" +
          data?.updated_by +
          "&remark=" +
          data?.remark,
        data
      )
        .then((res) => {
          setValue("memberId", "");
          setValue("awvId", "");
          setValue("form_url", "");
          setValue("updated_by", "");
          setValue("remark", "");
          setFormSubmitisLoading(false);
          toast.success("Form update success");
          notificationRightDrawer(false);
          props.currentAWERightSidebarCloseDatatableReload(true);
        })
        .catch((err) => {
          setFormSubmitisLoading(false);
          toast.error(err?.response?.data?.message);
        });
    }
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
              <b>EDIT </b>
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="add-verification-model"
            enctype="multipart/form-data"
          >
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
            <div className="col-lg-12 align-items-center mb-3">
              <label class="file">
                <InputLabel id="demo-simple-select-outlined-label">
                  <b>Upload File</b>
                </InputLabel>
                <FormControl
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  style={{ maxWidth: "220px" }}
                >
                  {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                  <Controller
                    className="input-control"
                    name="file_upload"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        {...field}
                        ref={fileInput}
                        onChange={handleFileUpload}
                        className="custom_file_upload"
                      />
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                  {errors?.file_upload?.type === "required" && (
                    <label className="text-danger">
                      This field is required
                    </label>
                  )}
                </FormControl>
                <span class="file-custom"></span>
              </label>
            </div>
            {fileName && fileName != "" ? (
              <div className="col-lg-12 align-items-center mb-3">
                <InputLabel id="demo-simple-select-outlined-label">
                  <b>PDF</b>
                </InputLabel>
                <div className="mt-3">
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
                  <a href={formFileUrl} target="_blank">
                    {fileName}
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="col-lg-12 align-items-center mb-3">
              <InputLabel id="demo-simple-select-outlined-label">
                <b>REMARK</b>
              </InputLabel>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "70px" }}
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
            <div className="col-lg-12 align-items-center mb-3">
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
                className="mr-2 btn-custom-primary ml-2"
                variant="contained"
                disabled={
                  formSubmitisLoading && formSubmitisLoading == true
                    ? true
                    : false
                }
              >
                {/*  disabled={isLoading && isLoading == true ? true : false}  {props.editFormData && props.editFormData.id && props.editFormData.id != '' ? */}
                Update
                {/* :
                                        'Save'
                                    } */}
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
})(AddAWVFileUpload);

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
import { toast } from "react-toastify";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Autocomplete from "@mui/material/Autocomplete";
import PayToProvider from "../../Pages/config/PayToProvider.config.json";

const AWVMemberDetailsCoodinator = (props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitisLoading, setFormSubmitisLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const [providerData, setProviderData] = useState([]);
  const [selectGroupsArray, setSelectGroupsArray] = useState([]);
  const [providerValue, setProviderValues] = React.useState();
  const [inputValueHCC, setInputValueHCC] = React.useState("");
  const [inputValueProviderName, setInputValueProviderName] =React.useState("");

  useEffect(() => {
    if (
      props.aweRightSidebarType?.cin_id &&
      props.aweRightSidebarType?.cin_id != ""
    ) {
      editLoadFormData(
        props.aweRightSidebarType?.cin_id,
        props.aweRightSidebarType?.awv_id
      );
      setValue("awe_id", String(props.aweRightSidebarType?.awv_id));
      setValue("cin", props.aweRightSidebarType?.cin_id);
    }
  }, [props.aweRightSidebarType?.cin_id]);

  useEffect(() => {
    console.log(editFormData);
    if (editFormData?.awe_source && editFormData?.awe_source != "") {
      setValue("awe_source", editFormData?.awe_source);
      setValue(
        "receiver_date",
        Moment(editFormData?.receiver_date).format("YYYY-MM-DD")
      );
      setValue("received_method", editFormData?.received_method);
      setValue("additional_data", editFormData?.additional_data);
      setValue(
        "telehealth_checkbox",
        editFormData?.telehelth_check
      ); /* correct the spell of telehelth to TELEHEALTH */
      setValue(
        "service_date",
        Moment(editFormData?.service_date).format("YYYY-MM-DD")
      );
      setValue("rendering_provider", editFormData?.rendering_provider);
      setValue("remarks", editFormData?.remarks);
      setValue("awe_id", String(props.aweRightSidebarType?.awv_id));
      setValue("cin", props.aweRightSidebarType?.cin_id);
      setProviderValues(editFormData?.Provider_Id);
      setInputValueProviderName(editFormData?.Provider_Name);
    }
  }, [editFormData]);e

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const editLoadFormData = (cinId, awvId) => {
    setIsLoading(true);
    AWVApi.get("/getawecoordinatorchecklist?cin=" + cinId + "&awe_id=" + awvId)
      // AWVApi.get('/get_member_hcc_details?member_id=3RE5W09MM81')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          res.data.forEach((element) => {
            if (
              props.aweRightSidebarType?.awe_source &&
              element.awe_source == props.aweRightSidebarType?.awe_source
            ) {
              setEditFormData(element);
              setIsLoading(false);
            }
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadProviderData();
  }, []);

  //load Pay to provider from JSON
  const loadProviderData = () => {
    let values = [];
    PayToProvider.forEach((element, index) => {
      if (!values.includes(element.providerId)) {
        values.push(element.providerId);
      }
    });
    setProviderData(values);
  };
  //to auto populate Pay to provider on selection of Pay to provider
  var providerDesc = "";
  const autoPopulateProviderName = (value) => {
    if (value != null && value != "") {
      PayToProvider.forEach((ele, index) => {
        if (ele.providerId == value) {
          providerDesc = ele.providerName;
          setInputValueProviderName(providerDesc);
        }
      });
    } else {
      setInputValueProviderName("");
    }
  };

  const onSubmit = (data) => {
    if (data?.cin && data?.cin != "") {
      setFormSubmitisLoading(true);
      let controlUser = JSON.parse(localStorage.getItem("controlUser"));
      data.providerId = providerValue;
      data.providerName = inputValueProviderName;
      data.updated_by = controlUser?.user_id;
      data.additional_data = String(data?.additional_data);
      data.telehealth_checkbox = String(
        data?.telehealth_checkbox
      ); /* correct the spell of telehelth to TELEHEALTH */
      AWVApi.put("/update_awe_coordinator_checklist", data)
        .then((res) => {
          setValue("awe_source", "");
          setValue("receiver_date", "");
          setValue("received_method", "");
          setValue("additional_data", "");
          setValue("service_date", "");
          setValue("rendering_provider", "");
          setValue("remarks", "");
          setValue("telehealth_checkbox", "");
          setValue("awe_id", "");
          setValue("cin", "");
          setValue("Provider_Id", "");
          setProviderValues("");
          setValue("Provider_Name", "");
          setInputValueProviderName("");
          setFormSubmitisLoading(false);
          toast.success("Coodinator Record update success");
          notificationRightDrawer(false);
          props.currentAWERightSidebarCloseDatatableReload(true);
        })
        .catch((err) => {
          setFormSubmitisLoading(false);
          toast.error(err?.response?.data?.message);
        });
    }
  };

  console.log(errors);
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
                {props?.aweRightSidebarType?.status &&
                props?.aweRightSidebarType?.status == "1"
                  ? "COORDINATOR CHECKLIST ADD"
                  : "COORDINATOR CHECKLIST EDIT"}
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
        {isLoading == false ? (
          <form onSubmit={handleSubmit(onSubmit)} id="add-verification-model">
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>AWE SOURCE</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="awe_source"
                  value={editFormData?.awe_source}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
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
                      <MenuItem key={"Provider"} value={"Provider"}>
                        Provider
                      </MenuItem>
                      <MenuItem key={"HCD"} value={"HCD"}>
                        HCD
                      </MenuItem>
                      <MenuItem key={"Applecare"} value={"Applecare"}>
                        Applecare
                      </MenuItem>
                    </Select>
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.awe_source?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>RECEIVE DATE</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="receiver_date"
                  value={Moment(editFormData?.receiver_date).format(
                    "YYYY-MM-DD"
                  )}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="date"
                      {...field}
                      variant="outlined"
                      inputProps={{ max: Moment().format("YYYY-MM-DD") }}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.receiver_date?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>RECEIVED METHOD</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="received_method"
                  value={editFormData?.received_method}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
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
                      {/* correct the spell of emai to email */}
                      <MenuItem key={"Secure email"} value={"Secure email"}>
                        Secure email
                      </MenuItem>
                      <MenuItem key={"Fax"} value={"Fax"}>
                        Fax
                      </MenuItem>
                      <MenuItem key={"FTP"} value={"FTP"}>
                        FTP
                      </MenuItem>
                    </Select>
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.received_method?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>ADDITIONAL DATA</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="additional_data"
                  value={editFormData?.additional_data}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
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
                      <MenuItem key={"1"} value={"1"}>
                        Yes
                      </MenuItem>
                      <MenuItem key={"0"} value={"0"}>
                        No
                      </MenuItem>
                    </Select>
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.additional_data?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              {/* correct the spell of telehelth to TELEHEALTH */}
              <div className="mb-1">
                <strong>TELEHEALTH</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="telehealth_checkbox"
                  value={editFormData?.telehealth_checkbox}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
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
                      <MenuItem key={"1"} value={"1"}>
                        Yes
                      </MenuItem>
                      <MenuItem key={"0"} value={"0"}>
                        No
                      </MenuItem>
                    </Select>
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.telehealth_checkbox?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>

            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>SERVICE DATE</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="service_date"
                  value={Moment(editFormData?.service_date).format(
                    "YYYY-MM-DD"
                  )}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="date"
                      {...field}
                      variant="outlined"
                      inputProps={{ max: Moment().format("YYYY-MM-DD") }}
                    />
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.service_date?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>Rendering Provider</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="rendering_provider"
                  value={editFormData?.rendering_provider}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} variant="outlined" />
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.rendering_provider?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            {/* autopopulate fields */}
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>
                  Pay to Provider <span style={{ color: "red" }}> *</span>
                </strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="Provider_Id"
                  value={editFormData?.Provider_Id}
                  control={control}
                  render={({ field }) => (
                    //  <TextField  {...field} variant="outlined" />
                    <Autocomplete
                      value={providerValue}
                      onChange={(event, newValue) => {
                        setProviderValues(newValue);
                        autoPopulateProviderName(newValue);
                      }}
                      id="controllable-states-demo"
                      getOptionLabel={(option = option.year.toString())}
                      options={providerData}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          value={providerValue}
                          inputProps={{
                            ...params.inputProps,
                            required: params.inputProps.value.length === 0,
                          }}
                          required={true}
                        />
                      )}
                    />
                  )}
                  /* rules={{
                                    required: false,                           // commenting this, added required under textField 
                                }} */
                />
                {/* {errors?.HCC_Code?.type === "required" && <label className="text-danger">This field is required</label>} */}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>
                  Pay to Provider Name <span style={{ color: "red" }}> *</span>
                </strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="Provider_Name"
                  value={inputValueProviderName}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      value={inputValueProviderName}
                      required
                    />
                  )}
                  /*  rules={{
                                     required: false,                      
                                 }} */
                />
                {/* {errors?.HCC_Description?.type === "required" && <label className="text-danger">This field is required</label>}*/}
              </FormControl>
            </div>
            {/* autopopulate fields */}

            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>SiteID</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="siteID"
                  value={editFormData?.siteID}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} variant="outlined" />
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.siteID?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>PPG</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="ppg"
                  value={editFormData?.ppg}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} variant="outlined" />
                  )}
                  rules={{
                    required: true,
                  }}
                />
                {errors?.ppg?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>

            <div className="col-lg-12 align-items-center mb-3 mt-3">
              <div className="mb-1">
                <strong>REMARKS</strong>
              </div>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ "min-width": "200px" }}
              >
                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="remarks"
                  value={editFormData?.remarks}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} variant="outlined" />
                  )}
                  rules={{
                    required: false,
                  }}
                />
                {errors?.remarks?.type === "required" && (
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
                className={"mr-2 btn-custom-primary mr-2 ml-2"}
                variant="contained"
                disabled={
                  formSubmitisLoading && formSubmitisLoading == true
                    ? true
                    : false
                }
              >
                {props?.aweRightSidebarType?.status &&
                props?.aweRightSidebarType?.status == "1"
                  ? "ADD"
                  : "UPDATE"}
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
})(AWVMemberDetailsCoodinator);

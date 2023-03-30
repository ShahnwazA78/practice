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
import hcc_json from "../../Pages/config/HCC_Code.config.json";
import dx_json from "../../Pages/config/DX_Code.config.json";
import Autocomplete from "@mui/material/Autocomplete";

const AWVMemberDetails = (props) => {
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
  const [hccData, setHCCData] = useState([]);
  const [selectGroupsArray, setSelectGroupsArray] = useState([]);
  const [hccValue, setHCCValues] = React.useState();
  const [inputValueHCC, setInputValueHCC] = React.useState("");
  const [inputValueHCCDescription, setInputValueHCCDescription] =
    React.useState("");
  const [inputValueDXDescription, setInputValueDXDescription] =
    React.useState("");
  const [dxValue, setDXValues] = React.useState();
  const [dxCodeData, setDXCodeData] = useState([]);

  useEffect(() => {
    if (
      props.aweRightSidebarType?.cin_id &&
      props.aweRightSidebarType?.cin_id != ""
    ) {
      editLoadFormData(props.aweRightSidebarType?.cin_id);
    }
  }, [props.aweRightSidebarType?.cin_id]);

  useEffect(() => {
    console.log(editFormData);
    if (editFormData?.HCC_Code && editFormData?.HCC_Code != "") {
      setValue("remark", editFormData?.remark);
      setValue("HCC_Confirmed", editFormData?.HCC_Confirmed);
      setValue("DX_description", editFormData?.DX_description);
      setValue("meat_flag", editFormData?.meat_flag);
      setValue("DX_code", editFormData?.DX_code);
      setValue("HCC_Description", editFormData?.HCC_Description);
      setValue("HCC_Code", editFormData?.HCC_Code);
      setValue("previous_hcc", editFormData?.HCC_Code);
      setValue("CIN", editFormData?.CIN);
      setHCCValues(editFormData?.HCC_Code);
      setInputValueHCCDescription(editFormData?.HCC_Description);
      setInputValueDXDescription(editFormData?.DX_description);
      setDXValues(editFormData?.DX_code);
    }
  }, [editFormData]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const editLoadFormData = (value) => {
    setIsLoading(true);
    AWVApi.get("/get_member_hcc_details?cin=" + value)
      // AWVApi.get('/get_member_hcc_details?member_id=3RE5W09MM81')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          res.data.forEach((element) => {
            if (
              props.aweRightSidebarType?.HCC_Code &&
              props.aweRightSidebarType?.HCC_Code &&
              element.DX_code == props.aweRightSidebarType?.DX_code &&
              element.HCC_Code == props.aweRightSidebarType?.HCC_Code
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
    loadHCCData();
    loadDXData();
  }, []);

  //load HCC codes from JSON
  const loadHCCData = () => {
    let values = [];
    hcc_json.forEach((element, index) => {
      if (!values.includes(element.hcc_code)) {
        values.push(element.hcc_code);
      }
    });
    setHCCData(values);
  };

  //load DX codes from JSON
  const loadDXData = () => {
    let values = [];
    dx_json.forEach((element, index) => {
      if (!values.includes(element.dx_code)) {
        values.push(element.dx_code);
      }
    });
    setDXCodeData(values);
  };

  const onSubmit = (data) => {
    if (hccValue && hccValue != "") {
      setFormSubmitisLoading(true);
      let controlUser = JSON.parse(localStorage.getItem("controlUser"));
      data.HCC_Code = hccValue;
      data.HCC_Description = inputValueHCCDescription;
      data.DX_code = dxValue;
      data.DX_description = inputValueDXDescription;
      if (data.DX_code == null) {
        data.DX_code = "";
      }
      data.cin = props.aweRightSidebarType?.cin_id;
      if (
        props?.aweRightSidebarType?.status &&
        props?.aweRightSidebarType?.status == "1"
      ) {
        data.created_by = controlUser?.user_id;
        data.created_on = Moment().format("YYYY-MM-DD HH:mm:ss");
        AWVApi.post("/create-hcc-details", data)
          .then((res) => {
            setValue("remark", "");
            setValue("HCC_Confirmed", "");
            setValue("DX_description", "");
            setInputValueDXDescription("");
            setValue("meat_flag", "");
            setValue("DX_code", "");
            setDXValues("");
            setValue("HCC_Description", "");
            setInputValueHCCDescription("");
            setValue("HCC_Code", "");
            setHCCValues("");
            setValue("previous_hcc", "");
            setValue("CIN", "");
            setHCCValues("");
            setInputValueHCCDescription("");
            setInputValueDXDescription("");
            setDXValues("");
            setFormSubmitisLoading(false);
            toast.success("Member HCC add success");
            notificationRightDrawer(false);
            props.currentAWERightSidebarCloseDatatableReload(true);
          })
          .catch((err) => {
            setFormSubmitisLoading(false);
            toast.error(err?.response?.data?.message);
          });
      } else {
        data.updated_by = controlUser?.user_id;
        AWVApi.put("/update-member-hcc-details", data)
          .then((res) => {
            setValue("remark", "");
            setValue("HCC_Confirmed", "");
            setValue("DX_description", "");
            setInputValueDXDescription("");
            setValue("meat_flag", "");
            setValue("DX_code", "");
            setDXValues("");
            setValue("HCC_Description", "");
            setInputValueHCCDescription("");
            setValue("HCC_Code", "");
            setHCCValues("");
            setValue("previous_hcc", "");
            setValue("CIN", "");
            setHCCValues("");
            setInputValueHCCDescription("");
            setInputValueDXDescription("");
            setDXValues("");
            setFormSubmitisLoading(false);
            toast.success("Member HCC update success");
            notificationRightDrawer(false);
            props.currentAWERightSidebarCloseDatatableReload(true);
          })
          .catch((err) => {
            setFormSubmitisLoading(false);
            toast.error(err?.response?.data?.message);
          });
      }
    }
  };

  //to auto populate HCC dexcription on selection of HCC code
  var hccDesc = "";
  const autoPopulateHccDescription = (value) => {
    if (value != null && value != "") {
      hcc_json.forEach((ele, index) => {
        if (ele.hcc_code == value) {
          hccDesc = ele.hcc_description;
          setInputValueHCCDescription(hccDesc);
        }
      });
    } else {
      setInputValueHCCDescription("");
    }
  };

  //to auto populate dx dexcription on selection of dx code
  var dxDesc = "";
  const autoPopulateDXDescription = (value) => {
    if (value != null && value != "") {
      dx_json.forEach((ele, index) => {
        if (ele.dx_code == value) {
          dxDesc = ele.dx_description;
          setInputValueDXDescription(dxDesc);
        }
      });
    } else {
      setInputValueDXDescription("");
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
              <b>
                {props?.aweRightSidebarType?.status &&
                props?.aweRightSidebarType?.status == "1"
                  ? "Member Detail Report ADD"
                  : "Member Detail Report EDIT"}
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
                <strong>
                  HCC CODE <span style={{ color: "red" }}> *</span>
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
                  name="HCC_Code"
                  value={editFormData?.HCC_Code}
                  control={control}
                  render={({ field }) => (
                    //  <TextField  {...field} variant="outlined" />
                    <Autocomplete
                      value={hccValue}
                      onChange={(event, newValue) => {
                        setHCCValues(newValue);
                        autoPopulateHccDescription(newValue);
                      }}
                      id="controllable-states-demo"
                      options={hccData}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          value={hccValue}
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
                  HCC DESCRIPTION <span style={{ color: "red" }}> *</span>
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
                  name="HCC_Description"
                  value={inputValueHCCDescription}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      value={inputValueHCCDescription}
                      required
                    />
                  )}
                  /*  rules={{
                                     required: false,                      
                                 }} */
                />
                {/* {errors?.HCC_Description?.type === "required" && <label className="text-danger">This field is required</label>} }
                            </FormControl>
                        </div>
                        <div className="col-lg-12 align-items-center mb-3">
                            <div className='mb-1'><strong>DX CODE</strong></div>
                            <FormControl fullWidth margin="dense" variant="outlined" style={{ 'min-width': '200px' }}>
                                {/* <InputLabel id="demo-simple-select-outlined-label">User Name</InputLabel> */}
                <Controller
                  className="input-control"
                  name="DX_code"
                  value={editFormData?.DX_code}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
                    <Autocomplete
                      value={dxValue}
                      onChange={(event, newValue) => {
                        setDXValues(newValue);
                        autoPopulateDXDescription(newValue);
                      }}
                      id="controllable-states-demo"
                      options={dxCodeData}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} value={dxCodeData} />
                      )}
                    />
                  )}
                  /* rules={{
                                    required: true,  // remove the required field from DX_code , DX_description
                                }} */
                />
                {/* remove the required field from DX_code , DX_description */}
                {/* {errors?.DX_code?.type === "required" && <label className="text-danger">This field is required</label>} */}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>DX DESCRIPTION</strong>
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
                  name="DX_description"
                  value={inputValueDXDescription}
                  control={control}
                  render={({ field }) => (
                    //<TextField  {...field} variant="outlined" />
                    <TextField
                      {...field}
                      variant="outlined"
                      value={inputValueDXDescription}
                    />
                  )}
                  //remove the required field from DX_code , DX_description
                  /* rules={{
                                    required: true, 
                                }} */
                />
                {/* remove the required field from DX_code , DX_description */}
                {/*  {errors?.DX_description?.type === "required" && <label className="text-danger">This field is required</label>} */}
              </FormControl>
            </div>
            {/* Adding meatflag in the rightsidebar */}
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>Meat Flag</strong>
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
                  name="meat_flag"
                  value={editFormData?.meat_flag == 0 ? "YES" : "NO"}
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
                      <MenuItem key={"1"} value={"0"}>
                        Yes
                      </MenuItem>
                      <MenuItem key={"0"} value={"1"}>
                        No
                      </MenuItem>
                    </Select>
                  )}
                  rules={{ required: false }}
                />
                {errors?.meat_flag?.type === "required" && (
                  <label className="text-danger">This field is required</label>
                )}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
              <div className="mb-1">
                <strong>
                  HCC CONFIRMED <span style={{ color: "red" }}> *</span>
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
                  name="HCC_Confirmed"
                  value={editFormData?.HCC_Confirmed}
                  control={control}
                  render={({ field }) => (
                    // <TextField  {...field} variant="outlined" />
                    <Select
                      {...field}
                      required
                      labelId="module-multiple-checkbox-label"
                      id="module-multiple-checkbox"
                      // value={selectModule}
                      // onChange={handleChange}
                      label="Module"
                      variant="outlined"
                      // MenuProps={MenuProps}
                      menuPlacement="top"
                    >
                      <MenuItem key={"confirmed"} value={"confirmed"}>
                        Confirmed
                      </MenuItem>
                      <MenuItem key={"not confirmed"} value={"not confirmed"}>
                        Not Confirmed
                      </MenuItem>
                      <MenuItem
                        key={"no longer applicable"}
                        value={"no longer applicable"}
                      >
                        No Longer Applicable
                      </MenuItem>
                      <MenuItem key={"acute"} value={"acute"}>
                        Acute
                      </MenuItem>
                    </Select>
                  )}
                  /*  rules={{
                                     required: true,         // commenting this, added required under select 
                                 }} */
                />
                {/* {errors?.HCC_Confirmed?.type === "required" && <label className="text-danger">This field is required</label>} */}
              </FormControl>
            </div>
            <div className="col-lg-12 align-items-center mb-3">
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
                  name="remark"
                  value={editFormData?.remark}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} variant="outlined" />
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
                className={"mr-2 btn-custom-primary mr-2 ml-2"}
                variant="contained"
                disabled={
                  formSubmitisLoading && formSubmitisLoading == true
                    ? true
                    : false
                }
              >
                {
                  props?.aweRightSidebarType?.status &&
                  props?.aweRightSidebarType?.status == "1"
                    ? "ADD"
                    : "Save" // Label change edit -> save
                }
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
})(AWVMemberDetails);

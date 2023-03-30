import React, { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { connect } from "react-redux";
import {
  currentAWERightSidebarType,
  currentAWERightSidebar,
} from "../../store/actions";
import AWVApi from "../../assets/constants/AWVRafservice.Instance";
import Divider from "@mui/material/Divider";
import Moment from "moment";
import Tooltip from "@mui/material/Tooltip";
import CancelIcon from "@mui/icons-material/Cancel";
import { CircularProgress } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { styled } from "@mui/material/styles";
import TextField from "@material-ui/core/TextField";
import { toast } from "react-toastify";
import Button from "@material-ui/core/Button";

const QuickNotesAWE = (props) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
  } = useForm();
  const [formDataList, setFormDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitisLoading, setFormSubmitisLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadformDataTable(props.AwvId, props.CinId);
    editLoadFormData(props.AwvId, props.CinId);
  }, [props.CinId]);

  useEffect(() => {
    if (editFormData?.awv_id && editFormData?.awv_id != "") {
      let controlUser = JSON.parse(localStorage.getItem("controlUser"));
      setValue("awe_id", editFormData?.awv_id);
      setValue("cin", editFormData?.cin);
      setValue("year", props?.yearSelect);
      setValue("lob", props?.lobSelect);
      setValue("organisation_id", "1"); //To doi
      setValue("provider_group", props?.providerGroupSelect);
      setValue("member_id", editFormData?.member_id);
      setValue("createdOn", Moment().format("YYYY-MM-DD HH:mm:ss"));
      setValue("created_by", controlUser?.user_id);
      setValue("updated_by", controlUser?.user_id);
    }
  }, [editFormData]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const editLoadFormData = (valueAwv, valueCin) => {
    setIsLoading(true);
    AWVApi.get(
      "/get-all-awv-record?payment_year=" +
        props.yearSelect +
        "&organisation_id=1&lob=" +
        props.lobSelect +
        "&awvId=" +
        valueAwv +
        "&cin=" +
        valueCin +
        "&iSortCol_0=provider_group&sSortDir_0=asc&iDisplayStart=0&iDisplayLength=1&formAttached=0"
    )
      .then((res) => {
        console.log(res.data);
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

  const loadformDataTable = (valueAwv, valueCin) => {
    setIsLoading(true);
    AWVApi.get(
      "/get_awe_notes?cin=" +
        valueCin +
        "&awe_id=" +
        valueAwv +
        "&lob=" +
        props?.lobSelect +
        "&organisation_id=1&year=" +
        props?.yearSelect
    ) //'&provider_group=' + props?.providerGroupSelect
      .then((res) => {
        console.log(res.data);
        setFormDataList(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };
  const convertToPacificTime = (istTime) => {
    const istDateTime = new Date(istTime);
    const pacificDateTime = new Date(
      istDateTime.getTime() - (12 * 60 * 60 * 1000 + 30 * 60 * 1000)
    );
    return pacificDateTime;
  };

  const onSubmit = (data) => {
    console.log(data);
    alert(JSON.stringify(data));
    data.awe_id = data.awe_id.toString();
    setFormSubmitisLoading(true);
    data.createdOn = Moment(convertToPacificTime(data.createdOn)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    alert(data.createdOn);
    AWVApi.post("/create-awe-notes", data)
      .then((res) => {
        setValue("notes", "");
        setFormSubmitisLoading(false);
        toast.success("Notes added successfully");
        loadformDataTable(props.AwvId, props.CinId);
        // notificationRightDrawer(false);
      })
      .catch((err) => {
        setFormSubmitisLoading(false);
        toast.error(err?.response?.data?.message);
      });
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
              <b>QUICK NOTES</b>
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
      <div>
        <div class="awv-recored-right-sidebar-form">
          <div variant={"head"} style={{ width: "350px" }}>
            <form onSubmit={handleSubmit(onSubmit)} id="add-verification-model">
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
                    value={getValues("notes")}
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        multiline
                        rows={3}
                        {...field}
                        label="Notes"
                        variant="outlined"
                      />
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                  {errors?.notes?.type === "required" && (
                    <label className="text-danger">
                      This field is required
                    </label>
                  )}
                </FormControl>
              </div>
              <div className="col-lg-12 mt-3 mb-3">
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
                  Save
                </Button>
              </div>
            </form>
          </div>
          {isLoading ? (
            <div style={{ position: "absolute", top: "50%", left: "50%" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              {formDataList &&
                formDataList.map((element, index) => (
                  <div
                    key={"index"}
                    variant={"head"}
                    style={{ width: "350px", padding: "10px" }}
                  >
                    <div className="card p-2 expand-grid-custom">
                      <span className="mb-1" style={{ fontSize: "11px" }}>
                        <b>
                          {Moment(element.created_on).format(
                            "h:mm a, MMMM DD YYYY"
                          )}
                        </b>
                      </span>
                      <span style={{ fontSize: "11px", lineHeight: "1rem" }}>
                        {element.notes}
                      </span>
                      <div>
                        <span
                          className="mr-1"
                          style={{ color: "#777777", fontSize: "11px" }}
                        >
                          Added by:
                        </span>
                        <span style={{ color: "#1a9698", fontSize: "11px" }}>
                          <b> {element.created_by}</b>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    yearSelect: state.moduleFilter.yearSelect,
    lobSelect: state.moduleFilter.lobSelect,
    providerGroupSelect: state.moduleFilter.providerGroupSelect,
    aweRightSidebarType: state.moduleFilter.aweRightSidebarType,
    aweRightSidebar: state.moduleFilter.aweRightSidebar,
  };
};
export default connect(mapStateToProps, {
  currentAWERightSidebarType,
  currentAWERightSidebar,
})(QuickNotesAWE);

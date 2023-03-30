import React, { useRef, useState, useEffect } from "react";
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
import { convertToPacificTime } from "../../assets/constants/customRender";

const TimelineAWE = (props) => {
  const [formDataList, setFormDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formDataOnHoldList, setFormOnHoldDataList] = useState([]);
  const [mergeTimelineList, setMergeTimelineList] = useState([]);

  useEffect(() => {
    loadformDataTable(props.AwvId, props.CinId);
  }, [props.CinId]);

  useEffect(() => {
    loadformOnHold(props.AwvId, props.CinId);
  }, [formDataList]);

  const notificationRightDrawer = (open, valueId = "") => {
    props.currentAWERightSidebarType({ type: "notification" });
    props.currentAWERightSidebar(open);
  };

  const loadformDataTable = (valueAwv, valueCin) => {
    setIsLoading(true);
    AWVApi.get(
      "/get-awv-remark?cin=" +
        valueCin +
        "&awvId=" +
        valueAwv +
        "&lob=" +
        props?.lobSelect
    )
      .then((res) => {
        if (res.data && res.data[0]) {
          var approvalRemarks =
            res?.data && res?.data[0] && res?.data[0]["approvalRemarks"]
              ? res?.data[0]["approvalRemarks"]
              : [];
          var rejectionRemarks =
            res?.data && res?.data[0] && res?.data[0]["rejectionRemarks"]
              ? res?.data[0]["rejectionRemarks"]
              : [];
          var conactArray = approvalRemarks.concat(rejectionRemarks);
          conactArray.sort(function (a, b) {
            var dateA = new Date(a.timestamp),
              dateB = new Date(b.timestamp);
            return dateB - dateA;
          });

          // alert(JSON.stringify(conactArray));
          // conactArray.map((element,index)=>(
          // element.timestamp=Moment(convertToPacificTime(element.timestamp)).format('YYYY-MM-DD HH:mm:ss')));
          
          if (conactArray && conactArray.length > 0) {
            setFormDataList(conactArray);
            setMergeTimelineList(conactArray);
          } else if (
            approvalRemarks.length == 0 &&
            rejectionRemarks.length == 0
          ) {
            setFormDataList([]);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setFormDataList([]);
        setIsLoading(false);
      });
  };

  const loadformOnHold = (valueAwv, valueCin) => {
    setIsLoading(true);
    AWVApi.get(
      "/get-hold-status-remark?cin=" +
        valueCin +
        "&aweId=" +
        valueAwv +
        "&lob=" +
        props?.lobSelect +
        "&organisation_id=1&year=" +
        props?.yearSelect
    ) //'&provider_group=' + props?.providerGroupSelect
      .then((res) => {
        var onHoldRemarks =
          res?.data && res?.data[0] && res?.data[0]["onHoldRemarks"]
            ? res?.data[0]["onHoldRemarks"]
            : [];
        var conactArrayNew = formDataList.concat(onHoldRemarks);
        conactArrayNew.sort(function (a, b) {
          var dateA = new Date(a.timestamp),
            dateB = new Date(b.timestamp);
          return dateB - dateA;
        });
        setMergeTimelineList(conactArrayNew);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
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
              <b>TIMELINE</b>
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
        {isLoading ? (
          <div style={{ position: "absolute", top: "50%", left: "50%" }}>
            <CircularProgress />
          </div>
        ) : (
          <div class="awv-recored-right-sidebar-form">
            {mergeTimelineList &&
              mergeTimelineList.map((element, index) => (
                <div
                  key={"index"}
                  variant={"head"}
                  style={{ width: "350px", padding: "10px" }}
                >
                  <div className="card p-2 expand-grid-custom">
                    <span className="mb-1" style={{ fontSize: "11px" }}>
                      <b>
                        {Moment(convertToPacificTime(element.timestamp)).format(
                          "h:mm a, MMMM DD YYYY"
                        )}
                      </b>
                    </span>
                    <span style={{ fontSize: "11px", lineHeight: "1rem" }}>
                      {element.remarks}
                    </span>
                    <div>
                      <span
                        className="mr-1"
                        style={{ color: "#777777", fontSize: "11px" }}
                      >
                        Last updated by:
                      </span>
                      <span style={{ color: "#1a9698", fontSize: "11px" }}>
                        <b>
                          {element.role && element.role != ""
                            ? element.role
                            : element.form_hold_by && element.form_hold_by != ""
                            ? element.form_hold_by
                            : ""}
                        </b>
                      </span>
                    </div>
                    {element.reason_code_description &&
                    element.reason_code_description != "" ? (
                      <div>
                        <span
                          className="mr-1"
                          style={{ color: "#777777", fontSize: "11px" }}
                        >
                          Reason Code:
                        </span>
                        <span style={{ color: "#1a9698", fontSize: "11px" }}>
                          {element.reason_code_description}
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              ))}
          </div>
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
})(TimelineAWE);

import { useState } from "react";

function FormInput({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    ></input>
  );
}

export default function TestPreview() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  return (
    <div className="form">
      <video
        src={
          "https://storage.googleapis.com/learn_co_th_lams_stg_test/Test_Upload/180824_TheEarth_19_graded.mp4"
        }
      ></video>
      <FormInput value={value1} setValue={setValue1} />
      <FormInput value={value2} setValue={setValue2} />
      <FormInput value={value3} setValue={setValue3} />
      <div>
        <p>{value1}</p>
        <p>{value2}</p>
        <p>{value3}</p>
      </div>
    </div>
  );
}

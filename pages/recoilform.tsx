import React, { useState } from "react";
import { RecoilRoot } from "recoil";

export default function Container() {
  return (
    <RecoilRoot>
      <RecoilForm></RecoilForm>
    </RecoilRoot>
  );
}

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

function RecoilForm() {
  return (
    <div className="form">
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

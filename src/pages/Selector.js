/**
 * Selector.js
 */

 import React from "react";

 /**
  * this component will create a 'dropdown' with options
  */
 
const SelectOptions = (props) =>{

    if(props.options == null){return null;}
    
    const options = props.options.map((option) => {
        return <option key={option} value={option}>{option}</option>
    });

    return (
        <select className="form-select" style={ {"margin" :  "10px"}}
            onChange={props.optionSelected} >
            <option key={""} value={""}>{props.baseText}</option>
            {options}
        </select>
    );

}

class Selector extends React.Component{

    render(){
        const { options, handlechange } = this.props;

        return(
            <SelectOptions options={options}  optionSelected={handlechange} baseText={"Escolha um utilizador"}/>

        )
    }
}

export default Selector;
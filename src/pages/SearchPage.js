/**
 * File available at https://github.com/mui/material-ui/tree/v5.10.3/docs/data/material/getting-started/templates/sign-in
 * This is an example form
 */

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';



/**
 * 
 * @param {*} props List of items in props.options, the handle function in props.optionSelected and a default Text in props.baseText
 * @returns html Select Tag filled with the given data
 */
const SelectOptions = (props) =>{

  //If no options were provided then return null
  if(props.options == null){return null;}

  const options = props.options.map((option) => {
    return <option key={option} value={option}>{option}</option>
  });

  return (
  <select className="form-select" style={ {"marginTop" :  "10px"}}
      onChange={props.optionSelected} >
      <option key={""} value={""}>{props.baseText}</option>
      {options}
  </select>
  );

}

/**
 * 
 * @returns List of users in the database 
 */
async function getUsers() {
  // read the users'data from API
  let users = '';
  try {
    users = await fetch("http://localhost:5109/api/users").then(response => response.json());
  } catch (error) {
    console.log("An Error Occurred while fetching the users List");
  }

  return users;
}

/**
 * 
 * @param {*} user name of the user to be used
 * @returns list of names of the groups the given user belongs to 
 */
async function getGroups(user) {
  // read the users'data from API
  let groups = "";
  try {
    groups = await fetch("http://localhost:5109/api/groups/groups/"+user).then(response => response.json());
  } catch (error) {
    console.log("An Error Occurred while fetching the group List");
  }
  return groups;
}

/**
 * 
 * @param {*} grupname name of the group to be used
 * @returns list of the boards that the given group contains
 */
async function getboards(grupname) {
  // read the users'data from API
  let groups = "";
  try {
    console.log("http://localhost:5109/api/boards/getboards/"+grupname);
    groups = await fetch("http://localhost:5109/api/boards/getboards/"+grupname).then(response => response.json());
  } catch (error) {
    console.log("An Error Occurred while fetching the boards List");
  }
  return groups;
}

// More Pretty tools (similar to "bootstrap", i also used "mui") 
const theme = createTheme();

class SearchPage extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      usernames: [],
      groups: [],
      boards :[],
      selecteduser : "",
      selectedgroup : "",
      selectedboard : ""
    }

  }


  /**
   * this function acts like a 'startup' when
   * the component is started
   */
   componentDidMount() {
    this.LoadUsers();
  }

/**
 * Loads the users data into state variables
 */
  async LoadUsers() {
    try {
      // ask for data, from API
      let users = await getUsers();

      // after receiving data, store it at state
      this.setState({ usernames: users })

    } catch (ex) {
      console.error("Error: it was not possible to read the' data", ex)
    }
  }

  /**
   * Loads the groups data into state variables
   */
  async LoadGroups() {
    
    // get the currently selected user
    var user = this.state.selecteduser;
    
    try {

      // get the groups of the user, from API
      let groups = await getGroups(user);

      // after receiving data, store it at state
      this.setState({ groups: groups })

    } catch (ex) {
      console.error("Error: it was not possible to read the' data", ex)
    }

  }

  /**
   * Loads the boards data into state variables
   */
  async LoadBoards() {
    
    // get the currently selected group
    var groupname = this.state.selectedgroup;
    
    try {

      // get the groups of the user, from API
      let boards = await getboards(groupname);
      // after receiving data, store it at state
      this.setState({ boards: boards })

    } catch (ex) {
      console.error("Error: it was not possible to read the' data", ex)
    }

  }

  /**
   * Handle functions - Only serve to update the states
   * @param {*} event event that triggered tthe functions
   */
  handleUserChange = (event) => {
    this.setState({ selecteduser: event.target.value }, this.LoadGroups);
  }

  handleGroupChange = (event) => {
    this.setState({ selectedgroup: event.target.value }, this.LoadBoards);
  }

  handleBoardChange = (event) => {
    this.setState({ selectedboard: event.target.value });
  }


  /**
   * Serves to change Routes based on the chosen settings
   * @param {*} event event that triggered tthe functions
   */
  handleSearch(event) {

      // prepare the url
      var location = "http://localhost:3000/board?board="+event.target.value;
      
      if (event.target.value !== "") {
        window.location.href = location;
      } 

  }
  
  render() {
    const { usernames, groups, boards} = this.state;

    return ( 
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            
            {/* Image of lock from mui */}
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
              
            {/* Image of lock from mui */}
            <Typography component="h1" variant="h5">
              Search
            </Typography>
            
              {/* props {options, optionSelected, "baseText"*/}
              <SelectOptions options={usernames} optionSelected={this.handleUserChange} baseText={"Escolha um utilizador"}/>
              <SelectOptions options={groups} optionSelected={this.handleGroupChange} baseText={"Escolha um grupo"}/>
              <SelectOptions options={boards} optionSelected={this.handleBoardChange} baseText={"Escolha um Quadro"}/>
              <Button type="Button" onClick={this.handleSearch} value={this.state.selectedboard} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}> Search </Button>
            
          </Box>
      </Container>
      </ThemeProvider>
    );
  }

}
export default SearchPage;
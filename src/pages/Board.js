
import * as React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import '../css/group.css'
import Selector from './Selector.js'


/**
 * @returns the table header
 */
function Header(){
  return(
    <thead>
      <tr>
        <th>Nome</th>
        <th>Pode Ler</th>
        <th>Pode Editar</th>
        <th>Remover</th>
      </tr>
    </thead>
  );
}

/**
 * 
 * @param {*} group name of the group that requires it's user list
 * @returns array containing names of the users belonging tto the group given
 */
async function getUsersInGroup(group) {

  // read the users'data from API
  let groups = "";

  try {
    groups = await fetch("http://localhost:5109/api/groups/users/"+group).then(response => response.json());
  } catch (error) {
    console.log("An Error Occurred while fetching the users in "+ group);
  }

  return groups;
}

/**
 * 
 * @param {*} boardid id of the board that requires the permission list
 * @returns an array containing dictionaries with the following description
 * {username:"", CanRead:false/true, CanWrite:false/true} 
 */
async function getUsers(boardid) {
  
  // read the users'data from API
  let users = '';
  
  try {

    users = await fetch("http://localhost:5109/api/perms/"+boardid).then(response => response.json());
  } catch (error) {
    console.log("An Error Occurred while fetching the users List");
    //Redirect to Main Page in case the boardid given isn't valid
    document.location = document.location.origin;
  }

  return users;
}

class Board extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      usersList: [],
      usersSelector: [],
      groupname: "",
      selectedUser: "",
      boardid:""
    }

  }

  /**
   * this function acts like a 'startup' when
   * the component is started
   */
  componentDidMount() {
    this.LoadUsersList();
    this.LoadGroupUsers();
  }
/**
 * Loads the user's List into the state variables
 */
  async LoadUsersList(){
    try {
      //Gets the boardid from the GET parameter "board"
      const boardid = new URLSearchParams(window.location.search).get('board');

      //Retrives the name of the group that contains the given boardid
      const groupname = await this.getBoardOwner(boardid);

      // ask for data, from API
      let users = await getUsers(boardid);

      // set state variables for re-use
      this.setState({ boardid : boardid })
      this.setState({ groupname : groupname })
      this.setState({ usersList : users })

    } catch (ex) {
      console.error("Error: it was not possible to read the user's data at LoadUsersList:", ex)
    }
  }
  
  /**
   * Loads the users tha belong to the group but dont have any set permissions
   */
  async LoadGroupUsers(){
    try {
      
      //Gets the boardid from the GET parameter "board"
      const boardid = new URLSearchParams(window.location.search).get('board');

      //Retrives the name of the group that contains the given boardid
      const groupname = await this.getBoardOwner(boardid);

      // ask for data, from API
      let users = await getUsersInGroup(groupname);

      //Removes the users that already have permissions from the list
      this.state.usersList.forEach(user => {
        if (users.includes(user.username)) {
          users.splice(users.indexOf(user.username),1)
        }
      });

      // set state variables for re-use
      this.setState({ usersSelector : users })

    } catch (ex) {
      console.error("Error: it was not possible to read the' data", ex)
    }
  }
  
  /**
   * 
   * @param {*} boardid id of the board 
   * @returns name of the group that contains the board
   */
  async getBoardOwner(boardid){
    
    let groupname = '';
    try {
      // read the users'data from API
      groupname = await fetch("http://localhost:5109/api/boards/GetOwner/"+boardid).then(response => response.json());
      
    } catch (error) {
      console.log("An Error Occurred while fetching the owner of the board");
    }
  
    return groupname[0];
  }

  /**
   * 
   * @param {*} e event that triggered the function for value access
   * @param {*} usr user related to the given row
   * @param {*} type permission is read or write
   */
  onItemCheck(e, usr, type) {

    
    //type not valid
    if (["read","write"].indexOf(type) < 0) {
      console.log("onItemCheck: Valid type not Provided.");
      return
    }

    //Prepares the data
    let tempList = this.state.usersList;
    let formData = new FormData();
    formData.append("username", usr.username);
    formData.append("operation", type);
    formData.append("boardid", this.state.boardid);

    //loop tttrough tto find the affected user and invert the value of the action(read/write)
    tempList.map((user) => {
      if (user.username === usr.username) {

        if (type == "read") {
          user.CanRead = e.target.checked;  
          formData.append("value", user.CanRead);
        }else if(type == "write"){
          user.CanWrite = e.target.checked;
          formData.append("value", user.CanWrite);
        }
        
      }
      return user;
    });

   
    // send data to API
    fetch("http://localhost:5109/api/perms/",
      {
        method: "POST",
        body: formData
      }
    );

    // Update State
    this.setState({ usersList: tempList });
  }

  /**
   * 
   * @param {*} username name of the user to be removed from the permission List
   * PS: The user still belongs to the group, but stops having knowledge about this particular board
   */
  async deleteuser(username){

    //Prepare the data
    let formData = new FormData();
    formData.append("username", username);
    formData.append("boardid", this.state.boardid);

    // send data to API
    let resposta = await fetch("http://localhost:5109/api/perms/",
      {
        method: "DELETE",
        body: formData
      }
    );

    //Checks if the operation runned sucsessfully
    if (!resposta.ok) {
      throw new Error("It ws not possible to remove the user. Code: ", resposta.status)
    } else {
      alert("The user was removed");
    }

    //Refreshes the Page to Remove the extra <tr> (Not the state itself)
    window.location.reload();
  }

  //Change the state variable holding the currently selected user to add to the permission List
  handleSelectorUser = (event) => {
    this.setState({ selectedUser: event.target.value });
    //console.log("User Selected "+event.target.value)
}

async handleSearch(event) {

  //Prepare the Data
  let formData = new FormData();
  formData.append("username", event.target.value);
  formData.append("boardid", new URLSearchParams(window.location.search).get('board'));

  // send data to API
  let resposta = await fetch("http://localhost:5109/api/perms/createperm",
    {
      method: "POST",
      body: formData
    }
  );

    //Checks if the operation runned sucsessfully
  if (!resposta.ok) {
    //console.error(resposta);
    throw new Error("it was not possible to add the User. Code: ",
      resposta.status)
  }

  //Reloads to get the updated information
  window.location.reload();
}

  render() {

    const { usersList, groupname, boardid, usersSelector } = this.state;
    
    const Body = (props) => {
    
      const rows = props.usersList.map((user) => {

        return(
          <tr key={user.username} className={user.CanRead ? "selected" : ""}>
            <td>{user.username}</td>
            <td>
              <input
                type="checkbox"
                checked={eval(user.CanRead)}
                className="form-check-input"
                id={user.username}
                onChange={(e) => this.onItemCheck(e, user, "read")}
              />
            </td>

            <td>
              <input
                type="checkbox"
                checked={eval(user.CanWrite)}
                className="form-check-input"
                id={user.username}
                onChange={(e) => this.onItemCheck(e, user, "write")}
              />
            </td>

            <td>
            <a href="#" onClick={(e) => this.deleteuser(user.username)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16" style={{color: "black"}}><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
            </a>
            </td>

          </tr>);
          })
    
    
      return(
        <tbody>
          {rows}
        </tbody>
      );
    }


    return ( 
      <div className='tableDiv'>
        <h1>{groupname} - {boardid}</h1>
        <Form method="post" name="fileinfo">

        <Table striped bordered hover>
          <Header/>
          <Body usersList={usersList} />
        </Table>

        <div>
          <Selector options={usersSelector} handlechange={this.handleSelectorUser}/>
          <button 
            type="button" 
            className="btn btn-primary"  
            onClick={(event) => {
              var exists = false;
              usersList.forEach(user => {
                if (user.username == this.state.selectedUser) {
                  //user already has permissions associated with them
                  exists = true;
                  return
                }
              });

              if (!exists) {
                this.handleSearch(event);
              }
              
            }} 
            value={this.state.selectedUser}  >Adicione um utilizador do grupo</button>
        </div>
        </Form>
      </div>
    )
  }
}

export default Board
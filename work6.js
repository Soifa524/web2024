const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCkvT00ET_mmOgOtFX2QxOW9xYYhtt9Rs",
  authDomain: "web2566-99aad.firebaseapp.com",
  projectId: "web2566-99aad",
  storageBucket: "web2566-99aad.appspot.com",
  messagingSenderId: "3767012069",
  appId: "1:3767012069:web:2arest49647322aecbe3e20c",
  measurementId: "G-W32JCNDQRJ"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Define the StudentTable component  
function StudentTable({data, app}){
    return <table className='table'>
    <tr>
        <td>รหัส</td>
        <td>คำนำหน้า</td>
        <td>ชื่อ</td>
        <td>สกุล</td>
        <td>email</td>
        <td>phone</td>
        </tr>
        {
          data.map((s)=><tr>
          <td>{s.id}</td>
          <td>{s.title}</td>
          <td>{s.fname}</td>
          <td>{s.lname}</td>
          <td>{s.email}</td>
          <td>{s.phone}</td>
          <td><EditButton std={s} app={app}/></td>
          <td><DeleteButton std={s} app={app}/></td>        
          </tr> )
        }
    </table>
  }



function TextInput({label,app,value,style}){
    return <label className="form-label">
    {label}:    
     <input className="form-control" style={style}
     value={app.state[value]} onChange={(ev)=>{
         var s={};
         s[value]=ev.target.value;
         app.setState(s)}
     }></input>
   </label>;  
}

function EditButton({std,app}){
    return <button onClick={()=>app.edit(std)}>แก้ไข</button>
}
 
function DeleteButton({std,app}){    
    return <button onClick={()=>app.delete(std)}>ลบ</button>
}

//Login Fuction
function LoginBox(props) {
  const u = props.user;
  const app = props.app;
  if (!u) {
      return <div><Button onClick={() => app.google_login()}>Login</Button></div>
  } else {
      return <div>
          <img src={u.photoURL} />
          {u.email}<Button onClick={() => app.google_logout()}>Logout</Button></div>
  }
}


firebase.auth().onAuthStateChanged((user) => {
  if (user) {
      this.setState({ user: user.toJSON() });
  } else {
      this.setState({ user: null });
  }
});



class App extends React.Component {
  title = (
    <Alert variant="info">
      <b>Work6 :</b> Firebase
    </Alert>
  );

  footer = (
    <div>
      By 653380347-4 สร้อยฟ้า รักนุช <br />
      College of Computing, Khon Kaen University
    </div>
  );

  state = {
    scene: 0,
    students:[],
    stdid:"",
    stdtitle:"",
    stdfname:"",
    stdlname:"",
    stdemail:"",
    stdphone:"",
    user: null,  // Add user state
  }

  //Login
  constructor(props) {
    super(props);
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            this.setState({ user: user.toJSON() });
        } else {
            this.setState({ user: null });
        }
    });
}

google_login() {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  firebase.auth().signInWithPopup(provider).then((result) => {
      this.setState({ user: result.user.toJSON() }, () => {
          this.readData(); // Fetch data immediately after login
      });
  }).catch((error) => {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
  });
}


google_logout() {
  if (confirm("Are you sure?")) {
      firebase.auth().signOut();
  }
}


componentDidMount() {
  firebase.auth().onAuthStateChanged((user) => {
      if (user) {
          this.setState({ user: user.toJSON() }, () => {
              this.readData(); // Read data only after authentication is complete
          });
      } else {
          this.setState({ user: null });
      }
  });
}

  // Define the readData function
  readData = () => {
    if (!this.state.user) {
        alert("You must log in to read data!");
        return;
    }

    db.collection("students")
      .get()
      .then((querySnapshot) => {
        const stdlist = [];
        querySnapshot.forEach((doc) => {
          stdlist.push({ id: doc.id, ...doc.data() });
        });
        this.setState({ students: stdlist });
      })
      .catch((error) => {
        alert("Error reading data: " + error.message);
        console.error("Error fetching data: ", error);
      });
  };

  
  autoRead = () => {
    if (!this.state.user) {
        alert("You must log in to auto-read data!");
        return;
    }

    this.unsubscribe = db.collection("students").onSnapshot(
        (querySnapshot) => {
            const stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        },
        (error) => {
            alert("Error in real-time data: " + error.message);
            console.error("Error in snapshot listener: ", error);
        }
    );
  };

  
  // Add componentWillUnmount to unsubscribe from the listener
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
}

  insertData() {
    if (!this.state.stdfname || !this.state.stdlname || !this.state.stdemail) {
        alert("กรุณากรอกข้อมูลให้ครบ (Please fill in all required fields)");
        return;
    }

    if (this.state.stdid) {
        db.collection("students").doc(this.state.stdid).set({
            title: this.state.stdtitle,
            fname: this.state.stdfname,
            lname: this.state.stdlname,
            phone: this.state.stdphone,
            email: this.state.stdemail,
        }, { merge: true }).then(() => {
            this.readData(); // Fetch updated data
        });
    } else {
        db.collection("students").add({
            title: this.state.stdtitle,
            fname: this.state.stdfname,
            lname: this.state.stdlname,
            phone: this.state.stdphone,
            email: this.state.stdemail,
        }).then(() => {
            this.readData(); // Fetch updated data
        });
    }

    this.setState({
        stdid: "",
        stdtitle: "",
        stdfname: "",
        stdlname: "",
        stdemail: "",
        stdphone: "",
    });
  }
  

  edit(std){      
      this.setState({
      stdid    : std.id,
      stdtitle : std.title,
      stdfname : std.fname,
      stdlname : std.lname,
      stdemail : std.email,
      stdphone : std.phone,
      })
  }

  delete(std){
      if(confirm("ต้องการลบข้อมูล")){
        db.collection("students").doc(std.id).delete().then(() => {
          this.readData();
      })
    }
  }


render() {
    // Check if required fields are filled
    const isFormValid = this.state.stdfname && this.state.stdlname && this.state.stdemail && this.state.stdphone;
  
    return (
      <Card>
        <Card.Header>{this.title}</Card.Header>  
        <Card.Body>
          <div>
          <LoginBox user={this.state.user} app={this}></LoginBox>  {/* Add LoginBox here */}
            <StudentTable data={this.state.students} app={this}></StudentTable>
          </div>
          <div className="mb-3">
            <Button variant="primary" onClick={()=>this.readData()} className="me-2">Read Data</Button>
            <Button variant="secondary" onClick={()=>this.autoRead()}>Auto Read</Button>
          </div>
        </Card.Body>
        <Card.Footer>
          <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b><br/>
          <div className="row g-3">
            <div className="col-md-2">
              <TextInput label="ID" app={this} value="stdid" style={{width:'100%'}}/>
            </div>
            <div className="col-md-2">
              <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{width:'100%'}} />
            </div>
            <div className="col-md-2">
              <TextInput label="ชื่อ" app={this} value="stdfname" style={{width:'100%'}}/>
            </div>
            <div className="col-md-2">
              <TextInput label="สกุล" app={this} value="stdlname" style={{width:'100%'}}/>
            </div>
            <div className="col-md-2">
              <TextInput label="Email" app={this} value="stdemail" style={{width:'100%'}} />
            </div>
            <div className="col-md-2">
              <TextInput label="Phone" app={this} value="stdphone" style={{width:'100%'}}/>
            </div>
          </div>
          <div className="mt-3">
            <Button 
              onClick={()=>this.insertData()} 
              disabled={!isFormValid}
              className="me-2"
            >
              Save
            </Button>
            <Button 
              variant="secondary" 
              onClick={()=>this.setState({
                stdid: "",
                stdtitle: "",
                stdfname: "",
                stdlname: "",
                stdemail: "",
                stdphone: "",
              })}
            >
              Clear
            </Button>
          </div>
        </Card.Footer>
        <Card.Footer>{this.footer}</Card.Footer>
      </Card>          
    );
  }
  

}

const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
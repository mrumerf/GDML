import { useEffect, useState } from "react";

import useStore from "../../../store";
import countriesData from '../../json/country.json'

import api from "../../../axios/api.js";

const ProfileScreen = () => {
    //hooks
    const [userData, setUserData] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [TN, setTN] = useState(false)
    const [CA, setCA] = useState(false)
    const [CP, setCP] = useState(false)

    //store vars
    const check = useStore(s => s.check);
    const defaultImage = useStore(s => s.defaultImage);
    const logout = useStore(state => state.logout)

    //functions

    //this sets CA,TN,CP to false making the input disappear
    const closeAll = () => {
        setTN(false)
        setCA(false)
        setCP(false)
    }

    const getUserData = async () => {
        try {

            const { data } = await api.get("/userProtected/get-user-data")
            setUserData(data);

        } catch (error) {
            alert('Something went wrong');
            console.log(error);
            check();
        }
    };

    const formatDate = (data) => {
        const date = new Date(data);
        const month = Number(date.getMonth());
        const day = date.getDate();
        const year = date.getFullYear();
        const monthArray = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthArray[month]} ${day}, ${year}`;
    };


    const handleNameChange = async (e) => {
        try {

            e.preventDefault()
            const formData = new FormData(e.target)
            formData.append('action', 'updateName')
            const { data } = await api.post("/userProtected/update-data", formData)

            setUserData(data)
            closeAll()

            if (formData.get('password')) {
                alert('Kindly login again!')
                logout(true)
            }
        } catch (err) {
            closeAll()
            console.log(err)
            alert("Something went wrong!")
        }
    }

    const updatePic = async (e) => {
        try {
            const file = e.target.files[0]; // Get the first selected file
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    setProfilePic(reader.result); // Set the uploaded image as the profile picture
                };
                reader.readAsDataURL(file); // Convert file to Base64

                const formData = new FormData(); // Create a new FormData instance
                formData.append("picture", file); // Append the file to FormData
                formData.append('action', 'updateName')

                const { data } = await api.post("/userProtected/update-data", formData)

                setUserData(data)
                closeAll()
            }

        } catch (error) {
            console.log(error)
        }
    }

    //useEffect
    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (userData.picture) {
            const imageString = Buffer.from(userData.picture.buffer.data).toString("base64")
            const base64String = `data:${userData.picture.mimeType};base64,${imageString}`
            setProfilePic(base64String)
        } else
            setProfilePic(defaultImage); // Initialize with default image
    }, [userData])

    //styles
    const styles = {
        roles: {
            display: 'grid',
            gridTemplateRows: '245% auto',
            alignItems: 'end'
        },
        inputSpan: {
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            fontSize: '.8rem'
        }
        ,
        container: {
            fontFamily: "Arial, sans-serif",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "fit-content",
            margin: "auto",
            backgroundColor: "#f9f9f9",
        },
        header: {
            display: "grid",
            alignItems: "center",
            borderBottom: "1px solid #ddd",
            paddingBottom: "15px",
            marginBottom: "15px",
            gridTemplateColumns: '1fr 7fr',
            gap: '.5em'
        },
        profileImageContainer: {
            position: "relative",
            width: "60px",
            height: "60px",
        },
        profileImage: {
            borderRadius: "50%",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
        },
        fileInput: {
            display: "none",
        },
        info: {
            flex: 1,
        },
        name: {
            fontSize: "20px",
            fontWeight: "bold",
        },
        email: {
            color: "#555",
            fontSize: "14px",
            margin: "5px 0",
            display: 'flex',
            justifyContent: 'space-between'
        },
        company: {
            fontSize: "14px",
            color: "#666",
        },
        details: {
            display: "grid",
            justifyContent: "space-between",
            gridTemplateColumns: "1.2fr .8fr",
            gap: '0 0.2em'
        },
        section: {
            flex: 1,
            margin: "10px",
        },
        sectionTitle: {
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "8px",
        },
        address: {
            fontSize: "14px",
            color: "#333",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: '0.4em'
        },
        password: {
            fontSize: "14px",
        },
        changeLink: {
            fontSize: "12px",
            color: "#0072C6",
            textDecoration: "underline",
            cursor: "pointer",
        },
        formButton: {
            fontSize: "12px",
            color: "#0072C6",
            textDecoration: "underline",
            cursor: "pointer",
            outLine: '0',
            border: '0',
            backgroundColor: 'transparent'
        },
        alertField: {
            fontSize: '70%',
            fontWeight: '100',
            color: 'red'
        }
    };

    return (
        <>
            {userData ? (
                <div style={styles.container}>
                    <div style={styles.header}>
                        <div style={styles.profileImageContainer}>
                            <label htmlFor="fileInput">

                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    style={styles.profileImage}
                                />
                            </label>
                            <form onChange={updatePic}>

                                <input
                                    name="picture"
                                    id="fileInput"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    style={styles.fileInput}
                                />
                            </form>
                        </div>
                        {
                            TN ?
                                <form style={styles.info} onSubmit={handleNameChange}>
                                    <div style={styles.name}>
                                        <input name="first_name" defaultValue={userData.first_name}></input>
                                        <input name="last_name" defaultValue={userData.last_name}></input>

                                    </div>
                                    <div style={styles.email}>
                                        Member Since: {formatDate(userData.member_since)}
                                    </div>
                                    <span style={styles.email}>Email: {userData.email}</span>
                                    <div style={styles.company}>
                                        <span style={{ ...styles.inputSpan, gridTemplateColumns: '1fr 3fr', width: '60%' }}>Company:
                                            <input type="text" name="company_name" defaultValue={userData.company_name} />
                                        </span>
                                    </div>
                                    <button style={styles.formButton} type="submit">(Change)</button>
                                </form>
                                : <div style={styles.info}>
                                    <div style={styles.name}>
                                        <span style={{ display: 'flex', gap: '0.2em' }}>
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                {userData.first_name || "First Name"} {userData.last_name || "Last Name"}
                                                <span style={styles.changeLink} onClick={() => setTN(true)}>(Change)</span>
                                            </span>
                                            {(userData.first_name && userData.last_name) ? '' : <pre style={styles.alertField}>First name and last name are mandatory</pre>}
                                        </span>
                                    </div>
                                    <div style={styles.email}>
                                        Member Since: {formatDate(userData.member_since)}
                                    </div>
                                    <span style={styles.email}><span>
                                        Email: {userData.email}
                                    </span>
                                        <span>
                                            Role: {userData.role}
                                        </span>
                                    </span>
                                    <div style={styles.company}>
                                        {userData.company_name && "Company: " + userData.company_name}
                                    </div>
                                </div>
                        }
                    </div>
                    <div style={styles.details}>
                        <div style={styles.section}>
                            {
                                CA ?
                                    <form onSubmit={handleNameChange}>
                                        <div style={styles.sectionTitle}>
                                            ADDRESS
                                        </div>
                                        <span style={styles.inputSpan}>Address Line 1:
                                            <input style={{ width: '60%' }} name="first_address" defaultValue={userData.first_address}></input>
                                        </span>
                                        <span style={styles.inputSpan}>Address Line 2:
                                            <input style={{ width: '60%' }} name="second_address" defaultValue={userData.second_address}></input>
                                        </span>
                                        <span style={styles.inputSpan}>City:
                                            <input style={{ width: '60%' }} name="city" defaultValue={userData.city}></input>
                                        </span>
                                        <span style={styles.inputSpan}>Zip Code:
                                            <input style={{ width: '60%' }} name="zip_code" defaultValue={userData.zip_code}></input>
                                        </span>
                                        <span style={styles.inputSpan}>State/Region:
                                            <input style={{ width: '60%' }} name="state_region" defaultValue={userData.state_region}></input>
                                        </span>
                                        <span style={styles.inputSpan}>Country:
                                            <select name="country" style={{ width: '64%' }} defaultValue={userData.country}>
                                                <option value="" style={{ width: "64%" }}>Select Country</option>
                                                {countriesData.map((country, index) => (
                                                    <option key={index} style={{ width: "64%" }} value={country.name}>{country.name}</option>
                                                ))}
                                            </select>
                                        </span>

                                        <button style={styles.formButton} type="submit">(Change)</button>
                                    </form>
                                    :
                                    <>
                                        <div style={styles.sectionTitle}>
                                            ADDRESS
                                            <span style={styles.changeLink} onClick={() => setCA(true)}>(Change)</span>
                                        </div>
                                        <div style={styles.address}>
                                            <span>
                                                Address Line 1:
                                            </span>
                                            {userData.first_address ?
                                                <span> {userData.first_address}</span> :
                                                <span style={{ color: 'red' }}>
                                                    This field is mandatory
                                                </span>
                                            }
                                            {userData.second_address &&
                                                <>
                                                    <span>
                                                        Address Line 2:
                                                    </span>
                                                    <span>
                                                        {userData.second_address}
                                                    </span>
                                                </>
                                            }
                                            <span>
                                                City:
                                            </span>
                                            {userData.city ?
                                                <span> {userData.city}</span> :
                                                <span style={{ color: 'red' }}>
                                                    This field is mandatory
                                                </span>
                                            }
                                            <span>
                                                Zip Code:
                                            </span>
                                            {userData.zip_code ?
                                                <span> {userData.zip_code}</span> :
                                                <span style={{ color: 'red' }}>
                                                    This field is mandatory
                                                </span>
                                            }
                                            <span>
                                                State/Region:
                                            </span>
                                            {userData.state_region ?
                                                <span> {userData.state_region}</span> :
                                                <span style={{ color: 'red' }}>
                                                    This field is mandatory
                                                </span>
                                            }
                                            <span>
                                                Country:
                                            </span>
                                            {userData.country ?
                                                <span> {userData.country}</span> :
                                                <span style={{ color: 'red' }}>
                                                    This field is mandatory
                                                </span>
                                            }
                                        </div>
                                    </>
                            }

                        </div>
                        <div style={styles.section}>
                            {
                                CP ?
                                    <form onSubmit={handleNameChange}>
                                        <div style={styles.sectionTitle}>
                                            Password
                                        </div>
                                        <input name="password" type="password" required></input>
                                        <button style={styles.formButton} type="submit">(Change)</button>
                                    </form>
                                    :
                                    <>
                                        <div style={styles.sectionTitle}>
                                            PASSWORD
                                            <span style={styles.changeLink} onClick={() => setCP(true)}>(Change)</span>
                                        </div>
                                        <div style={styles.password}>********</div>
                                    </>
                            }
                        </div>
                    </div>
                </div>
            )
                :
                <h1>Loading...</h1>
            }
        </>
    );
};

export default ProfileScreen;

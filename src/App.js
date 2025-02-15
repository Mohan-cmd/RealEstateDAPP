import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
   
  const [account,setAccount] =useState(null)
  const [provider,setProvider] =useState(null)
  const [escrow,setEscrow] = useState(null)
  const [homes,setHomes] = useState(null)
  const [toggle,setToggle] =useState(false)
  const [home,setHome]= useState({})
   const loadBlockchainData = async () =>{
       const provider = new ethers.providers.Web3Provider(window.ethereum);
       setProvider(provider);

       const network = await provider.getNetwork();
       //console.log("Helli",config[network.chainId].realEstate.address)
        //console.log(provider)
       const realEstate = new ethers.Contract(config[network.chainId].realEstate.address,RealEstate,provider);
       const totalSupply = await realEstate.totalSupply();
       const escrow = new ethers.Contract(config[network.chainId].escrow.address,Escrow,provider);
       setEscrow(escrow)
       const homes=[]
       for(var i=1;i<=totalSupply;i++){
        const uri = await realEstate.tokenURI(i);
        const response = await fetch(uri);
        const metadata = await response.json();
        console.log(metadata)
         homes.push(metadata);
       }
        setHomes(homes)
       console.log("real",realEstate )
       window.ethereum.on('accountsChanged', async ()=>{
          const accounts = await window.ethereum.request({method:'eth_requestAccounts'})
          const account = ethers.utils.getAddress(accounts[0])
          setAccount(account)
       })
       //console.log(account)
   }
   const togglePop =(home)=>{
    setHome(home);
     toggle ? setToggle(false) :setToggle(true);
   }
   useEffect(()=>{
      loadBlockchainData()
   },[])
  return (
    <div>

      <div className='cards__section'>
        
        {/* <h3>Welcome to Millow</h3> */}
        <Navigation account={account} setAccount={setAccount}/>
        <Search/>
      </div>
     <div className='cards__section'>
       <h3>Homes For You</h3>
      <div className='cards'>
        { homes &&
          
          homes.map((home,index)=>
            <div className='card' key={index} onClick={()=>togglePop(home)}>
              <div className='card__image'>
                 <img src={home.image} alt="home"/>
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          )
        }
      </div>
      {toggle && 
        <div>
          <Home home={home} account ={account} provider={provider}  escrow={escrow} togglePop={togglePop}/>
        </div>
      }
      </div>
    </div>
  );
}

export default App;

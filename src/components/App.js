import React, { useEffect, useState, useCallback, Component } from "react"
import Web3 from "web3"
import "./App.css"
import MemoryToken from "../abis/MemoryToken.json"
import brain from "../brain.png"

const CARD_ARRAY = [
  {
    name: "fries",
    img: "/images/fries.png",
  },
  {
    name: "cheeseburger",
    img: "/images/cheeseburger.png",
  },
  {
    name: "ice-cream",
    img: "/images/ice-cream.png",
  },
  {
    name: "pizza",
    img: "/images/pizza.png",
  },
  {
    name: "milkshake",
    img: "/images/milkshake.png",
  },
  {
    name: "hotdog",
    img: "/images/hotdog.png",
  },
  {
    name: "fries",
    img: "/images/fries.png",
  },
  {
    name: "cheeseburger",
    img: "/images/cheeseburger.png",
  },
  {
    name: "ice-cream",
    img: "/images/ice-cream.png",
  },
  {
    name: "pizza",
    img: "/images/pizza.png",
  },
  {
    name: "milkshake",
    img: "/images/milkshake.png",
  },
  {
    name: "hotdog",
    img: "/images/hotdog.png",
  },
]

const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    window.alert(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    )
  }
}

const { networks, abi } = MemoryToken
const App = props => {
  const [cardArray, setCardArray] = useState([])
  const [account, setAccount] = useState("0x0")
  const [tokenURIs, setTokenURIs] = useState([])
  const [token, setToken] = useState()
  const [cardsWon, setCardsWon] = useState([])
  const [cardsChosenId, setCardsChosenId] = useState([])
  const [cardsChosen, setCardsChosen] = useState([])
  const [totalSupply, setTotalSupply] = useState(0)
  const [results, setResults] = useState([])

  useEffect(async () => {
    await loadWeb3()
    await loadBlockchainData()
    setCardArray(CARD_ARRAY.sort(() => 0.5 - Math.random()))
  }, [])

  useEffect(() => {
    if (cardsChosen.length === 2) {
      console.log(cardsChosen)
      checkForMatch()
    }
  }, [cardsChosen])

  const loadBlockchainData = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = networks[networkId]

    if (networkData) {
      const address = networkData.address
      const contractToken = new web3.eth.Contract(abi, address)

      setToken(contractToken)

      const contractTotalSupply = await contractToken.methods
        .totalSupply()
        .call()

      setTotalSupply(contractTotalSupply)

      // Load Tokens
      let balanceOf = await contractToken.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await contractToken.methods
          .tokenOfOwnerByIndex(accounts[0], i)
          .call()
        let tokenURI = await contractToken.methods.tokenURI(id).call()
        setTokenURIs(state => [...state, tokenURI])
      }
    } else {
      alert("Smart contract not deployed to detected network.")
    }
  }

  const onMatch = async cardsChosenId => {
    return await token.methods
      .mint(
        account,
        window.location.origin + CARD_ARRAY[cardsChosenId[0]].img.toString()
      )
      .send({ from: account })
      .on("transactionHash", hash => {
        setCardsWon(state => [...state, ...cardsChosenId])
        setTokenURIs(state => [...state, CARD_ARRAY[cardsChosenId[0]].img])
      })
  }

  const chooseImage = cardId => {
    cardId = cardId.toString()
    if (cardsWon.includes(cardId)) {
      return window.location.origin + "/images/white.png"
    } else if (cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else {
      return window.location.origin + "/images/blank.png"
    }
  }

  const checkForMatch = useCallback(async () => {
    const optionOneId = cardsChosenId[0]
    const optionTwoId = cardsChosenId[1]

    console.log(cardsChosenId)
    if (optionOneId === optionTwoId) {
      setResults(state => [...state, "You have clicked the same image!"])
    } else if (cardsChosen[0] === cardsChosen[1]) {
      setResults(state => [...state, "You found a match"])
      await onMatch(cardsChosenId)
    } else {
      setResults(state => [...state, "Sorry, try again"])
    }

    // Pause before removing chosen cards
    setTimeout(() => {
      setCardsChosen([])
      setCardsChosenId([])
    }, 500)

    if (cardsWon.length === CARD_ARRAY.length) {
      setResults(state => [...state, "Congratulations! You found them all!"])
    }
  }, [cardsChosenId, cardsChosen])

  const flipCard = cardId => {
    setCardsChosen(state => [...state, cardArray[cardId].name])
    setCardsChosenId(state => [...state, cardId])
  }

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={brain}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt=""
          />
          &nbsp; Memory Tokens
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-muted">
              <span id="account">{account}</span>
            </small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <h1 className="d-4">Start matching now!</h1>

              <div className="grid mb-4">
                {cardArray.map((card, key) => {
                  return (
                    <img
                      key={key}
                      src={chooseImage(key)}
                      data-id={key}
                      onClick={evt => {
                        let cardId = evt.target.getAttribute("data-id")

                        if (
                          cardsChosen.length !== 2 &&
                          !cardsWon.includes(cardId.toString())
                        ) {
                          flipCard(cardId)
                        }
                      }}
                    />
                  )
                })}
              </div>

              <div>
                <h5>
                  Tokens Collected:
                  <span id="result">&nbsp;{tokenURIs.length}</span>
                </h5>

                <div className="grid mb-4">
                  {tokenURIs.map((tokenURI, key) => {
                    return <img key={key} src={tokenURI} />
                  })}
                </div>
              </div>

              <div>
                {results.map((result, key) => {
                  return (
                    <div key={key} class="alert alert-dark" role="alert">
                      {result}
                    </div>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App

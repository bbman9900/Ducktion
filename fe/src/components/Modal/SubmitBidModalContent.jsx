import { useEffect, useState } from 'react'
import { getUserBidPoint } from '../../services/bidService'
import GodoTitleLabel from '../Labels/GodoTitleLabel'
import PreTextLabel from '../Labels/PreTextLabel'
import PreCaptionLabel from '../Labels/PreCaptionLabel'
import RectangleButton from '../Button/RectangleButton'
import RoundButton from '../Button/RoundButton'
import PriceSummary from '../PriceSummary'
import '@styles/components/modal/BidPointModalContent.css'

export default function SubmitBidModalContent({ probs, onClose }) {
  const { itemName, startingBid, nowPrice, immediateBid } = probs
  const [currentBidPoint, setCurrentBidPoint] = useState(0);
  const [usableBid, setUsableBid] = useState(0);

  const getBidIncrement = (bidPoint) => {
    if (bidPoint >= 1000000) {
      return 100000;
    } else if (bidPoint >= 10000) {
      return 10000;
    }
    return 1000;
  };

  const getMinBidPoint = () => {
    const baseBidPoint = nowPrice || startingBid;
    const plusBidPoint = getBidIncrement(baseBidPoint);
    return baseBidPoint + plusBidPoint;
  }

  const handlePlusIcon = () => {
    const plusBidPoint = getBidIncrement(currentBidPoint);
    const newBidPoint = currentBidPoint + plusBidPoint;
    setCurrentBidPoint(newBidPoint);
  };

  const handleMinusIcon = () => {
    const plusBidPoint = getBidIncrement(currentBidPoint);
    const minBidPoint = getMinBidPoint();
    const newBidPoint = currentBidPoint - plusBidPoint < minBidPoint ? minBidPoint : currentBidPoint - plusBidPoint;
    setCurrentBidPoint(newBidPoint);
  }

  const handleChange = (e) => {
    const value = parseInt(e.target.value);
    setCurrentBidPoint(value);
  };

  const handleSubmit = () => {
    if (immediateBid && currentBidPoint > immediateBid) {
      alert(`입찰가는 즉시 낙찰가를 초과할 수 없습니다.`);
      return;
    }

    if (currentBidPoint > usableBid) {
      alert('사용 가능한 비드가 부족합니다.');
      return;
    }
  };

  const fetchUserBidPoint = async() => {
    const data = await getUserBidPoint();
    setUsableBid(data.usableBid);
  };

  useEffect(() => {
    fetchUserBidPoint();  
    const minBidPoint = getMinBidPoint();
    setCurrentBidPoint(minBidPoint);
  }, [])

  return (
    <div className='modal_contaier'>
      <GodoTitleLabel text={'입찰하기'} />
      <PreTextLabel text={itemName} />
      <RoundButton options={[{vlaue: "", title: `사용 가능한 비드 ${usableBid}`}]} />

      <PriceSummary startingBid={startingBid} nowPrice={nowPrice} immediateBid={immediateBid} />
      <PreCaptionLabel text={"*즉시 낙찰가를 초과하는 입찰은 불가합니다."} style={{ color: "#bebebe" }} />

      <div className='bidInput_container'>
        <button className='bidInput_button' onClick={handleMinusIcon}>
        <img src="/src/assets/minus.png" width={20} height={20}/>
        </button>
        <input
          type='text'
          className='bidInput_field'
          value={currentBidPoint}
          onChange={handleChange}
          disabled={true}
        />
        <button className='bidInput_button' onClick={handlePlusIcon}>
          <img src="/src/assets/plus.png" width={20} height={20}/>
        </button>
      </div>

      <div className='bidPointModalContent_buttons'>
        <RectangleButton text="취소" onClick={onClose} />
        <RectangleButton text="확인" onClick={handleSubmit}/>
      </div>
    </div>
  )
}
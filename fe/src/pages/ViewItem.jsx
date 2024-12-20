import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import RectangleButton from '../components/Button/RectangleButton';
import "../styles/pages/ViewItem.css"
import HorizontalRule from '../components/HorizontalRule';
import GodoTitleLabel from '../components/Labels/GodoTitleLabel';
import PreTitleLabel from '../components/Labels/PreTitleLabel';
import PreSubTitleLabel from '../components/Labels/PreSubTitleLabel';
import { getItemDetails, postItemRareScore, putBiddingGiveup, putReport, postBidding, postImmediateBidding } from '../services/itemService';
import PriceSummary from '../components/PriceSummary';
import StarRating from '../components/Button/StarRating';
import { useModal } from '../hooks/useModal'
import SubmitBidModalContent from '../components/Modal/SubmitBidModalContent'
import CustomModal from '../components/Modal/CustomModal'

// const ViewItem = ({ itemId }) => {
const ViewItem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const maxFileSize = 2 * 1024 * 1024; // 2MB
  const maxFileCount = 9; // 최대 파일 개수

  const [data, setData] = useState({
    communityId: 1,
    communityName: "리그오",
    itemId: 1,
    itemName: "상",
    images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_8Rj-vULPVGhf-eQyiY5sG2dMcHFQzD6RrQ&s"],
    description: "아아아 하기 싫다ㅏㅏㅏ",
    itemCondition: "사용감 적음",
    rareGrade: "마",
    startingBid: 10000,
    auctionEndDate: "2025-01-07T23:59:59",
    nowPrice: 10000,
    totalView: 10000,
    totalBidding: 10000,
    exhibitorNickName: "오쿠맨",
    exhibitorRate: 58,
    immediateBid: '',
  }); // 이미지 URL 상태
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 보여지는 이미지 인덱스
  const [remainingTime, setRemainingTime] = useState(""); // 남은 시간
  const [isBlinking, setIsBlinking] = useState(false); // 깜빡임 상태 관리
  const [rareScore, setRareScore] = useState(null); // 레어 점수 (별점)
  const [isReported, setIsReported] = useState(false); // 레어 점수 (별점)
  const { isModalOpen, modalContent, openModal, closeModal } = useModal();

  // 컴포넌트가 마운트될 때 get 요청
  useEffect(() => {
    const itemId = 1;

    if (!itemId) {
      console.error("itemId가 전달되지 않았습니다.");
      return;
    }
    // 예: API 호출
    async function fetchItemDetails() {
      try {
        // 실제 API 호출 로직 작성 필요
        const response = await getItemDetails(itemId);
        // const data = await response.json();
        console.log(response);
        // setData(data);
        setData(response);
        // console.log(data.images);
      } catch (error) {
        console.error("아이템 정보를 불러오는 데 실패했습니다:", error);
        alert("아이템 정보를 불러오는 데 실패했습니다");
      }
    }

    fetchItemDetails();
  }, []);

  useEffect(() => {
    setImages(data.images); // 상태가 변경된 후에 데이터를 확인
  }, [data]);

  // 남은 시간에 따라 업데이트
  useEffect(() => {
    let interval; // 업데이트를 관리하는 변수

    const updateRemainingTime = () => {
      const now = new Date(); // 현재 시간
      const auctionEnd = new Date(data.auctionEndDate); // 경매 종료 시간
      const diff = auctionEnd - now; // 남은 시간 (밀리초)

      if (diff <= 0) {
        // 경매 종료 시 처리
        clearTimeout(interval);
        setRemainingTime("경매 종료");
        setIsBlinking(false); // 깜빡임 비활성화
        return;
      }

      // 남은 시간 상태 업데이트
      setRemainingTime(calculateRemainingTime(diff));

      // 깜빡임 활성화 여부 설정 (5분 이내일 때 활성화)
      setIsBlinking(diff <= 5 * 60 * 1000);

      // 동적 업데이트 주기 설정
      clearTimeout(interval); // 기존 동작 제거

      if (diff > 24 * 60 * 60 * 1000) {
        // 24시간 이상 남음: 자정에 업데이트
        const nextMidnight = new Date(now);
        nextMidnight.setDate(now.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        const timeToMidnight = nextMidnight - now;
        interval = setTimeout(updateRemainingTime, timeToMidnight);
      } else if (diff > 5 * 60 * 1000) {
        // 5분 ~ 24시간 남음: 분 단위가 바뀔 때 업데이트
        const nowMilliseconds = now.getTime();
        const nextMinuteMilliseconds = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes() + 1,
          0,
          0
        ).getTime();
        const timeToNextMinute = nextMinuteMilliseconds - nowMilliseconds;
        interval = setTimeout(updateRemainingTime, timeToNextMinute);
      } else {
        // 5분 이하: 초 단위 업데이트
        const nowMilliseconds = now.getTime();
        const nextSecondMilliseconds = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds() + 1,
          0
        ).getTime();
        const timeToNextSecond = nextSecondMilliseconds - nowMilliseconds;
        interval = setTimeout(updateRemainingTime, timeToNextSecond);
      }
    };

    updateRemainingTime(); // 초기 실행

    // 컴포넌트 언마운트 시 업데이트 정리
    return () => clearTimeout(interval); // 컴포넌트 언마운트 시 업데이트 정리
  }, [data.auctionEndDate]);


  // communityName 클릭 시 실행될 함수
  const handleCommunityClick = () => {
    if (data?.communityId) {
      navigate(`/community/${data.communityId}`);
    }
  };

  // 왼쪽 화살표 클릭 시 이전 이미지로 이동
  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? data.images.length - 1 : prevIndex - 1
    );
  };

  // 오른쪽 화살표 클릭 시 다음 이미지로 이동
  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === data.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const onBid = () => {
    const probs = {
      itemName: data.itemName, 
      startingBid: data.startingBid, 
      nowPrice: data.nowPrice, 
      immediateBid: data.immediateBid, 
    };

    openModal(<SubmitBidModalContent probs={probs} onClose={closeModal} />);
  };

  const onImmediateBid = async () => {
    const userConfirmed = window.confirm(`${data.immediateBid}비드로 즉시 낙찰 하겠습니까?`); // 확인창 표시

    if (!userConfirmed) {
      // 사용자가 "아니오"를 선택한 경우
      console.log("사용자가 즉시 낙찰을 취소했습니다.");
      return;
    }

    try {
      const biddingGiveupRequest = {
        userId: data.userId,
        itemId: data.itemId
      };

      const response = await postImmediateBidding(biddingGiveupRequest); // API 요청
      console.log("서버 응답:", response); // 응답 데이터 확인
    } catch (error) {
      console.error("입찰 포기 중 오류 발생:", error);
      alert("입찰 포기하는 데 실패했습니다.");
    }
  };

  // 남은 시간을 계산하는 함수
  const calculateRemainingTime = () => {
    const now = new Date(); // 현재 시간
    const auctionEnd = new Date(data.auctionEndDate); // 경매 종료 시간
    const diff = auctionEnd - now; // 시간 차이 (밀리초)

    if (diff <= 0) {
      return "경매 종료";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      // 24시간 이상: "n일" 표시
      return `${days}일`;
    } else if (diff <= 5 * 60 * 1000) {
      // 1시간 이내: "n분 n초" 표시
      return `${minutes}분 ${seconds}초`;
    }
    // 24시간 이내: 시간과 분만 표시
    return `${hours}시간 ${minutes}분`;
  };

  const handleRareScoreChange = async (value) => {
    const dto = {
      // userId: 1,
      itemId: data.itemId,
      rareScore: value,
    }; // 별점 포함된 dto 생성

    try {
      setRareScore(value);

      const response = await postItemRareScore(dto); // API 요청
      console.log("서버 응답:", response); // 응답 데이터 확인
      console.log(`${response.rareScore}점의 레어 등급 평가가 제출되었습니다.`);
      alert(`${response.rareScore}점의 레어 등급 평가가 제출되었습니다.`);
    } catch (error) {
      console.error("레어 등급 평가 제출 중 오류 발생:", error);
      alert("레어 등급 평가를 제출하는 데 실패했습니다.");
    }
  };

  const onReport = async () => {
    if (!isReported) {
      try {
        const response = await putReport(data.itemId); // API 요청
        console.log("서버 응답:", response); // 응답 데이터 확인
        setIsReported(true);
      } catch (error) {
        console.error("신고 중 오류 발생:", error);
        alert("신고하는 데 실패했습니다.");
      }
    } else {
      alert("이미 신고하신 상품입니다.");
    }
  };

  const onGiveup = async () => {
    const userConfirmed = window.confirm("정말 입찰을 포기하겠습니까?"); // 확인창 표시

    if (!userConfirmed) {
      // 사용자가 "아니오"를 선택한 경우
      console.log("사용자가 입찰 포기를 취소했습니다.");
      return;
    }

    try {
      const biddingGiveupRequest = {
        userId: data.userId,
        itemId: data.itemId
      };

      const response = await putBiddingGiveup(biddingGiveupRequest); // API 요청
      console.log("서버 응답:", response); // 응답 데이터 확인
    } catch (error) {
      console.error("입찰 포기 중 오류 발생:", error);
      alert("입찰 포기하는 데 실패했습니다.");
    }
  };

  if (!data) {
    return <p>로딩 중...</p>; // 데이터를 가져오기 전 로딩 상태 표시
  }

  return (
    <div className="view-myinfo-container">
      <CustomModal isOpen={isModalOpen} onClose={closeModal} content={modalContent} />
      
      {/* 화면 왼쪽 최상단에 communityName 표시 */}
      <div className="community-header" onClick={handleCommunityClick}>
        <GodoTitleLabel text={data.communityName || "커뮤니티 이름 없음"} />
      </div>

      <div className="main-content">
        <div className="slider-container">
          {/* 이미지 슬라이더 */}
          <div className="image-slider">
            <button className="arrow left-arrow" onClick={handlePrevClick}>
              {/* 왼쪽 화살표 */}
              <img src="/src/assets/left_arrow.png" alt="left_arrow" />
            </button>
            <div className="image-wrapper">
              {/* 메인 이미지 */}
              <img
                src={data.images[currentImageIndex]}
                alt={`상품 이미지 ${currentImageIndex + 1}`}
                className="item-image"
              />
            </div>
            <button className="arrow right-arrow" onClick={handleNextClick}>
              {/* 오른쪽 화살표 */}
              <img src="/src/assets/right_arrow.png" alt="right_arrow" />
            </button>

            {/* 썸네일 리스트 */}
            <div className="thumbnail-container">
              {data.images.map((url, index) => {
                // 5장의 썸네일만 보여주는 슬라이딩 로직
                const visibleIndex =
                  Math.max(0, currentImageIndex - 2) + index < data.images.length
                    ? Math.max(0, currentImageIndex - 2) + index
                    : null;

                return (
                  visibleIndex !== null && (
                    <img
                      key={index}
                      src={data.images[visibleIndex]}
                      alt={`썸네일 이미지 ${visibleIndex + 1}`}
                      className={`thumbnail ${visibleIndex === currentImageIndex ? "active" : ""
                        }`}
                      onClick={() => setCurrentImageIndex(visibleIndex)}
                    />
                  )
                );
              })}
            </div>
          </div>

          {/* 버튼 추가 */}
          <div className="slider-buttons">
            <button className="icon-button report-button" onClick={onReport}>
              <img src="/src/assets/report.png" alt="신고하기" className="icon" />
              <span>신고하기</span>
            </button>
            <button className="icon-button bid-button" onClick={onGiveup}>
              <img src="/src/assets/give_up.png" alt="입찰 포기" className="icon" />
              <span>입찰 포기</span>
            </button>
          </div>
        </div>


        {/* 상품 정보 */}
        <div className="item-info">
          <h2 className="item-title">{data.itemName}</h2>
          <PriceSummary startingBid={data.startingBid} nowPrice={data.nowPrice} immediateBid={data.immediateBid} />

          {/* 버튼 영역 */}
          <div className="price-button-container">
            <RectangleButton text={"입찰"} onClick={onBid} />
            <RectangleButton text={"즉시 낙찰"} onClick={onImmediateBid} />
          </div>

          <div className="item-details">
            <div className="detail-row">
              <span className="label">남은 시간: </span>
              <span className={`remaining-time-value ${isBlinking ? "blinking" : ""}`} key={remainingTime} // key 속성을 이용한 재렌더링 트리거
              > {remainingTime}</span>
            </div>
            <div className="detail-row">
              <span className="label">조회수: </span>
              <span className="value"> {data.totalView.toLocaleString()}회</span>
            </div>
            <div className="detail-row">
              <span className="label">입찰 건수: </span>
              <span className="value">{data.totalBidding.toLocaleString()}건</span>
            </div>
            <div className="detail-row">
              <span className="label">상태: </span>
              <span className="value">{data.itemCondition}</span>
            </div>
            <div className="detail-row">
              <span className="label">레어 등급: </span>
              <span className="value">{data.rareGrade}</span>
            </div>
            <div className="detail-row">
              <span className="label">레어 등급 평가:</span>
              <div className="rating-wrapper">
                <StarRating rating={rareScore} onChange={handleRareScoreChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 설명, 출품자 정보 */}
      <div className="info-grid">
        {/* 왼쪽: 상세 설명 */}
        <div className="item-description">
          <h3>상세 설명</h3>
          <p>{data.description}</p>
        </div>

        {/* 구분선 */}
        <div className="vertical-separator"></div>

        {/* 오른쪽: 출품자 정보 */}
        <div className="exhibitor-info">
          <h3>출품자 정보</h3>
          <div className="detail-row">
            <span className="label">출품자:</span>
            <span className="value">{data.exhibitorNickName}</span>
          </div>
          <div className="detail-row">
            <span className="label">평점:</span>
            <span className="value">{data.exhibitorRate} 점</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ViewItem;
import '../styles/pages/RegistItem.css';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GodoTitleLabel from '../components/Labels/GodoTitleLabel';
import PreTitleLabel from '../components/Labels/PreTitleLabel';
import PreSubTitleLabel from '../components/Labels/PreSubTitleLabel';
import StarRating from '../components/Button/StarRating';
import NumericInput from '../components/NumericInput';
import RectangleButton from '../components/Button/RectangleButton';
import Calendar from '../components/Calendar';
import { validateImageFile } from "../utils/ImageFileValidators";
import { postItem } from '../services/itemService';


function RegistItem() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]); // 이미지 URL 상태
  const [imageFiles, setImageFiles] = useState([]); // 이미지 파일 상태
  const [itemName, setItemName] = useState(""); // 상품 이름 상태
  const [description, setDescription] = useState(""); // 상세 설명 상태
  const [itemCondition, setItemCondition] = useState(""); // 상품 상태
  const [rareScore, setRareScore] = useState(null); // 레어 점수 (별점)
  const [startingBid, setStartingBid] = useState(""); // 시작가
  const [auctionEndDate, setAuctionEndDate] = useState(null); // 경매 종료일
  const [immediateBid, setImmediateBid] = useState(""); // 즉시 낙찰가

  const fileInputRef = useRef(null);

  const maxFileSize = 2 * 1024 * 1024; // 2MB
  const maxFileCount = 9; // 최대 파일 개수




  // 상품 상태 변경 관리
  const handleConditionChange = (event) => {
    setItemCondition(event.target.value);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 파일 선택 창 열기
    }
  };

  // 이미지 URL 업로드 관리
  const handleFileChange = (event) => {
    const files = event.target.files;

    // 이미지 파일 필터링 (유효성 검사)
    const validImages = Array.from(files).filter((file) =>
      validateImageFile(file, maxFileSize) // 유틸리티 함수 호출
    );

    // 총 이미지 개수가 9개를 초과하면 업로드 제한
    if (images.length + validImages.length > maxFileCount) {
      alert("이미지는 최대 9장만 첨부할 수 있습니다.");
      return;
    }

    // 유효한 이미지 파일의 URL 생성 및 상태 업데이트
    const newImages = validImages.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);

    // 서버로 보낼 파일 객체 관리
    setImageFiles((prevValidImages) => [...prevValidImages, ...validImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleCancleClick = () => {
    navigate('/ViewCommunityList'); // 이동할 경로
  }

  const handleSubmitClick = async () => {
    // 필수 값 체크
    if (
      imageFiles.length === 0 || // 이미지가 선택되지 않음
      !itemName.trim() || // 상품 이름이 비어있음
      !description.trim() || // 상세 설명이 비어있음
      !itemCondition.trim() || // 상품 상태가 비어있음
      rareScore === null || // 레어 점수가 설정되지 않음
      !startingBid || // 시작가가 비어있음
      !auctionEndDate // 경매 종료일이 선택되지 않음
    ) {
      alert("필수 값을 입력해주세요.");
      return; // 조건을 만족하지 않으면 함수 종료
    }

    // 즉시 낙찰가가 시작가보다 낮은 경우 경고 표시
    if (immediateBid && Number(immediateBid) < Number(startingBid)) {
      alert("즉시 낙찰가는 시작가보다 낮게 입력할 수 없습니다.");
      return;
    }

    const formData = new FormData();

    // 이미지 파일 추가
    imageFiles.forEach((file) => {
      formData.append("imageFiles", file); // key 이름은 서버와 협의 필요
    });
    // 서버 업로드 API 로직 추가 필요
    // 새 이미지의 S3 URL을 images 배열에 덮어쓰기 필요

    // DTO 생성
    const dto = {
      itemName,
      imageFiles, // 이미지 파일 배열.
      description,
      itemCondition,
      rareScore,
      startingBid,
      auctionEndDate,
      immediateBid,
    };

    try {
      // API POST 요청
      const response = await postItem(dto);
      console.log("성공적으로 등록되었습니다:", response.data);

      // 성공적으로 등록 후 페이지 이동
      navigate("/viewItem");
    } catch (error) {
      console.error("상품 등록에 실패했습니다:", error);
      alert("상품 등록 중 문제가 발생했습니다.");
    }
  }

  // 상품 상태 라디오 버튼 화면
  const RadioButtonGroup = () => {
    const radioOptions = [
      { value: "NEW", label: "새 상품 (미사용)", description: "사용하지 않음 새 상품" },
      { value: "NO_USE", label: "사용감 없음", description: "사용은 했지만 눈에 띄는 흔적 없음" },
      { value: "LESS_USE", label: "사용감 적음", description: "눈에 띄는 흔적 있음" },
      { value: "MANY_USE", label: "사용감 많음", description: "눈에 띄는 흔적 많음" },
      { value: "BROKEN", label: "고장/파손 상품", description: "기능 손상으로 인해 수리/수선 필요" },
    ];

    return (
      <div className="radio-button-group">
        {radioOptions.map((option) => (
          <div className="radio-item" key={option.value}>
            <input
              type="radio"
              id={option.value}
              name="itemCondition"
              value={option.value}
              checked={itemCondition === option.value} // 현재 상태와 비교
              onChange={handleConditionChange} // 상태 변경 핸들러 사용
            />
            <label htmlFor={option.value}>
              <span className="radio-label">{option.label}</span>
              <span className="radio-description">{option.description}</span>
            </label>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="regist-item-container">
      <GodoTitleLabel text={"출품 상품 등록"} />
      <br />
      <PreTitleLabel text={"상품 정보"} />
      <hr className='divider-black' />
      <br />

      {/* 상품 이름 */}
      <div className="inline-container">
        <PreSubTitleLabel text={"상품 이름"} />
        <input
          type="text"
          placeholder="출품 상품 이름을 입력해주세요.(150자)"
          maxLength="150"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
      </div>

      {/* 사진 */}
      <hr className='divider-gray' />
      <br />
      <div className="inline-container">
        <PreSubTitleLabel text={"사진"} />
        <PreSubTitleLabel text={"(최대 9장)"} />
      </div>
      <div className="image-container">
        {/* 첫 번째 줄: 등록 버튼과 최대 3개의 이미지 */}
        <div className="image-row">
          {/* 이미지 등록 버튼 */}
          <div className="image-upload-wrapper" onClick={handleImageClick}>
            <div className="upload-icon">
              <img src="/src/assets/camera.png" alt="카메라 아이콘" />
              <div>이미지 등록</div>
            </div>
          </div>

          {/* 첫 번째 줄 이미지 */}
          {images.slice(0, 4).map((image, index) => (
            <div key={index} className="image-wrapper">
              <img
                src={image}
                alt={`첨부된 이미지 ${index + 1}`}
                className="preview-image"
              />
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveImage(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* 두 번째 줄: 최대 5개의 이미지 */}
        <div className="image-row">
          {images.slice(4).map((image, index) => (
            <div key={index} className="image-wrapper">
              <img
                src={image}
                alt={`첨부된 이미지 ${index + 5}`}
                className="preview-image"
              />
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveImage(index + 4)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        style={{ display: 'none' }}
      />

      {/* 상세 설명 */}
      <hr className='divider-gray' />
      <br />
      <div className="inline-container">
        <PreSubTitleLabel text={"상세 설명"} />
        <textarea
          name="상세 설명"
          id="detailed_description"
          cols="120"
          rows="5"
          placeholder='출품 상품의 상세 설명을 입력해주세요.'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* 상품 상태 */}
      <hr className="divider-gray" />
      <br />
      <div className="inline-container">
        <PreSubTitleLabel text={"상품 상태"} />
        <RadioButtonGroup />
      </div>

      {/* 레어 점수 평가 */}
      <hr className="divider-gray" />
      <br />
      <div className="inline-container">
        <PreSubTitleLabel text={"레어 점수 평가"} />
        <div className="star-rating-wrapper">
          <StarRating rating={rareScore} onChange={(rating) => setRareScore(rating)} />
        </div>
      </div>
      <p>현재 선택한 레어 점수: {rareScore}</p>

      <br />
      <br />

      <PreTitleLabel text={"경매 정보"} />
      <hr className='divider-black' />
      <br />

      <div className="inline-container">
        <PreSubTitleLabel text={"시작가"} />
        <NumericInput value={startingBid} onChange={(value) => setStartingBid(value)} placeholder="시작가를 입력해주세요." />
        <span>비드</span>
      </div>

      <hr className="divider-gray" />
      <br />
      <div className="inline-container">
        <PreSubTitleLabel text={"경매 종료일"} />
        <Calendar selected={auctionEndDate} onChange={(date) => setAuctionEndDate(date)} placeholderText='경매 종료일을 선택해주세요.' />
      </div>


      <br />
      <br />

      <div className="inline-container">
        <PreTitleLabel text={"추가 정보"} />
        <PreSubTitleLabel text={"선택 사항"} />
      </div>
      <hr className='divider-black' />
      <div className="inline-container">
        <PreSubTitleLabel text={"즉시 낙찰가"} />
        <NumericInput value={immediateBid} onChange={(value) => setImmediateBid(value)} placeholder="즉시 낙찰가를 입력해주세요." />
        <span>비드</span>
      </div>

      <br />
      <br />

      <div className="button-container">
        <RectangleButton text={"취소"} onClick={handleCancleClick} />
        <RectangleButton text={"확인"} onClick={handleSubmitClick} />
      </div>
    </div >
  );
}

export default RegistItem;
import React from 'react';
import Modal from 'react-modal';
import NavBar from '../../components/NavBar';
import AddEditTravelStory from './AddEditTravelStory';
import TravelStoryCard from '../../components/TravelStoryCard';
import axiosInstance from '../../utils/axiosinstance';
import { Bounce, Slide, ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import ViewTravelStory from '../../components/ViewTravelStory';

const Home = () => {
	const navigate = useNavigate();
	const [userInfo, setUserInfo] = useState(null);
	const [allStories, setAllStories] = useState([]);
	const [openAddEditModal, setOpenAddEditModal] = useState({
		isShown: false,
		type: 'add',
		data: null,
	});

	const [openViewModal, setOpenViewModal] = useState({
		isShown: false,
		data: null,
	});

	// get user info
	const getUserInfo = async () => {
		try {
			const response = await axiosInstance.get('/get-user');
			if (response.data && response.data.user) {
				setUserInfo(response.data.user);
			}
		} catch (error) {
			if (error.response.status === 401) {
				localStorage.clear();
				navigate('/login');
			}
		}
	};

	const getAllStories = async () => {
		try {
			const response = await axiosInstance.get('/get-all-travel-stories');
			if (response.data && response.data.stories) {
				setAllStories(response.data.stories);
			}
		} catch (error) {
			error(console.log('unexpected error occurred. Please try again'));
		}
	};

	// handle edit story
	const handleEdit = (data) => {
		setOpenAddEditModal({ isShown: true, type: 'edit', data: data });
	};

	// handle view story
	const handleViewStory = (data) => {
		setOpenViewModal({ isShown: true, data });
	};

	// handle update isFavorite
	const updateIsFavorite = async (storyData) => {
		const storyId = storyData._id;

		try {
			const response = await axiosInstance.put(
				'/update-is-favorite/' + storyId,
				{ isFavorite: !storyData.isFavorite }
			);

			if (response.data && response.data.story) {
				toast.success('Story Updated Successfully');
				getAllStories();
			}
		} catch (error) {
			error(
				console.log('An unexpected error occurred. Please try again')
			);
		}
	};

	const deleteTravelStory = async (data) => {
		const storyId = data._id;

		try {
			const response = await axiosInstance.delete(
				'/delete-travel-story/' + storyId
			);
			if (response.data) {
				toast.error('Story Deleted Successfully');
				setOpenViewModal((pervState) => ({
					...pervState,
					isShown: false,
				}));
				getAllStories();
			}
		} catch (error) {
			error.console.log(
				'An unexpected error occurred, Please try again.'
			);
		}
	};

	useEffect(() => {
		getUserInfo();
		getAllStories();

		return () => {};
	}, []);

	return (
		<>
			<NavBar userInfo={userInfo} />
			<div className="container mx-auto py-10">
				<div className="flex gap-7">
					<div className="flex-1 ">
						{allStories.length > 0 ? (
							<div className="grid grid-cols-2 gap-4">
								{allStories.map((item) => {
									return (
										<TravelStoryCard
											key={item._id}
											imgUrl={item.imageUrl}
											title={item.title}
											story={item.story}
											date={item.visitedDate}
											visitedLocation={
												item.visitedLocation
											}
											isFavorite={item.isFavorite}
											onEdit={() => handleEdit(item)}
											onClick={() =>
												handleViewStory(item)
											}
											onFavoriteClick={() =>
												updateIsFavorite(item)
											}
										/>
									);
								})}
							</div>
						) : (
							<>Empty Card here</>
						)}
					</div>
					<div className="w-[320px]"></div>
				</div>
			</div>

			{/* add edit travel story modal */}
			<Modal
				isOpen={openAddEditModal.isShown}
				openRequestClose={() => {}}
				style={{
					overlay: {
						backgroundColor: 'rgba(0,0,0,.2)',
						zIndex: 999,
					},
				}}
				appElement={document.getElementById('root')}
				className="model-box scrollbar"
			>
				<AddEditTravelStory
					type={openAddEditModal.type}
					storyInfo={openAddEditModal.data}
					onClose={() => {
						setOpenAddEditModal({
							isShown: false,
							type: 'add',
							data: null,
						});
					}}
					getAllStories={getAllStories}
				/>
			</Modal>

			{/* view travel story modal */}
			<Modal
				isOpen={openViewModal.isShown}
				openRequestClose={() => {}}
				style={{
					overlay: {
						backgroundColor: 'rgba(0,0,0,.2)',
						zIndex: 999,
					},
				}}
				appElement={document.getElementById('root')}
				className="model-box scrollbar"
			>
				<ViewTravelStory
					storyInfo={openViewModal.data || null}
					onClose={() => {
						setOpenViewModal((pervState) => ({
							...pervState,
							isShown: false,
						}));
					}}
					onEditClick={() => {
						setOpenViewModal((pervState) => ({
							...pervState,
							isShown: false,
						}));
						handleEdit(openViewModal.data || null);
					}}
					onDeleteClick={() => {
						deleteTravelStory(openViewModal.data || null);
					}}
				/>
			</Modal>

			<button
				className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed bottom-10 right-10"
				onClick={() => {
					setOpenAddEditModal({
						isShown: true,
						type: 'add',
						data: null,
					});
				}}
			>
				<MdAdd className="text-[32px] text-white" />
			</button>

			<ToastContainer />
		</>
	);
};

export default Home;

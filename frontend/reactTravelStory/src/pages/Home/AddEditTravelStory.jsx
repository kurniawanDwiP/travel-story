import React, { useState } from 'react';
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from 'react-icons/md';
import axiosInstance from '../../utils/axiosinstance';
import uploadImage from '../../utils/uploadImage';
import DateSelector from '../../components/DateSelector';
import ImageSelector from '../../components/ImageSelector';
import TagInput from '../../components/TagInput';
import moment from 'moment';
import { toast } from 'react-toastify';

const AddEditTravelStory = ({ storyInfo, type, onClose, getAllStories }) => {
	const [title, setTitle] = useState(storyInfo?.title || '');
	const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
	const [story, setStory] = useState(storyInfo?.story || '');
	const [visitedLocation, setVisitedLocation] = useState(
		storyInfo?.visitedLocation || []
	);
	const [visitedDate, setVisitedDate] = useState(
		storyInfo?.visitedDate || null
	);
	const [error, setError] = useState('');

	const updateTravelStory = async () => {
		const storyId = storyInfo._id;
		try {
			let imageUrl = '';
			let postData = {
				title,
				story,
				imageUrl: storyInfo.imageUrl || '',
				visitedLocation,
				visitedDate: visitedDate
					? moment(visitedDate).valueOf(visitedDate)
					: moment().valueOf(),
			};

			if (typeof storyImg === 'object') {
				const imgUploadRes = await uploadImage(storyImg);
				imageUrl = imgUploadRes.imageUrl || '';

				postData = {
					...postData,
					imageUrl: imageUrl,
				};
			}

			const response = await axiosInstance.put(
				'/edit-travel-story/' + storyId,
				postData
			);

			if (response.data && response.data.story) {
				toast.success('Story Updated Successfully');
				getAllStories();
				onClose();
			}
		} catch (error) {
			if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				setError(error.response.data.message);
				toast.error(error);
			} else {
				setError('Unexpected error occcured. Please try again.');
				toast.error(error);
			}
		}
	};

	const addNewTravelStory = async () => {
		try {
			let imageUrl = '';

			if (storyImg) {
				const imageUploadRes = await uploadImage(storyImg);
				imageUrl = imageUploadRes.imageUrl || '';
			}

			const response = await axiosInstance.post('/add-travel-story', {
				title,
				story,
				imageUrl: imageUrl || '',
				visitedLocation,
				visitedDate: visitedDate
					? moment(visitedDate).valueOf(visitedDate)
					: moment().valueOf(),
			});

			if (response.data && response.data.story) {
				toast.success('Story Added Successfully');
				getAllStories();
				onClose();
			}
		} catch (error) {
			console.error('Error adding story:', error);
			toast.error('Error adding story:', error);
		}
	};

	const handleAddOrUpdateClick = () => {
		console.log('Input Data:', {
			title,
			storyImg,
			story,
			visitedLocation,
			visitedDate,
		});

		if (!title) {
			setError('Please enter the title');
			return;
		}

		if (!story) {
			setError('Please enter the story');
			return;
		}

		setError('');

		if (type === 'edit') {
			updateTravelStory();
		} else {
			addNewTravelStory();
		}
	};

	const handleDeleteStoryImg = async () => {
		const deleteImgRes = await axiosInstance.delete('delete-image',{
			params:{
				imageUrl:storyInfo.imageUrl
			}
		})

		if(deleteImgRes.data){
			const storyId = storyInfo._id
			const postData = {
				title,
				story,
				visitedLocation,
				visitedDate: moment().valueOf(),
				imageUrl:''
			}

			const response = await axiosInstance.put('edit-story'+storyId,postData)
			setStoryImg(null)
		}
	};

	return (
		<div className="relative">
			<div className="flex items-center justify-between">
				<h5 className="text-5xl font-medium text-slate-700">
					{type === 'add' ? 'Add Story' : 'Update Story'}
				</h5>

				<div className="">
					<div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
						{type === 'add' ? (
							<button className="btn-small" onClick={handleAddOrUpdateClick}>
								<MdAdd className="text-lg" />
								ADD STORY
							</button>
						) : (
							<>
								<button className="btn-small" onClick={handleAddOrUpdateClick}>
									<MdUpdate className="text-lg" />
									UPDATE STORY
								</button>
							</>
						)}

						<button className="" onClick={onClose}>
							<MdClose className="text-xl text-slate-400" />
						</button>
					</div>
					{error && (
						<p className="text-red-500 text-xs pt-2 text-right">{error}</p>
					)}
				</div>
			</div>

			<div className="">
				<div className="flex flex-1 flex-col gap-2 pt-4">
					<label htmlFor="story-title" className="input-label">
						TITLE
					</label>
					<input
						id="story-title"
						type="text"
						className="text-2xl text-slate-950 outline-none"
						placeholder="A Day at the Great Wall"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
						}}
					/>
				</div>

				<div className="my-3">
					<DateSelector date={visitedDate} setDate={setVisitedDate} />
				</div>

				<ImageSelector
					image={storyImg}
					setImage={setStoryImg}
					handleDeleteImg={handleDeleteStoryImg}
				/>

				<div className="flex flex-col gap-2 mt-4">
					<label htmlFor="story-desc" className="input-label">
						STORY
					</label>
					<textarea
						id="story-desc"
						rows={10}
						type="text"
						className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
						placeholder="Your Story"
						value={story}
						onChange={(e) => {
							setStory(e.target.value);
						}}
					/>

					<div className="pt-3">
						<label htmlFor="visited-location" className="input-label">
							VISITED LOCATION
						</label>
						<TagInput tags={visitedLocation} setTags={setVisitedLocation} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddEditTravelStory;

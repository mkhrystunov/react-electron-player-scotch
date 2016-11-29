import React from 'react';

import Axios from 'axios';

import Sound from 'react-sound';

import Search from '../components/search.component';
import Details from '../components/details.component';
import Player from '../components/player.component';
import Progress from '../components/progress.component';

class AppContainer extends React.Component {
    constructor(props) {
        super(props);

        this.client_id = '2f98992c40b8edf17423d93bda2e04ab';

        this.state = {
            track: {stream__url: '', title: '', artwork_url: ''},
            playStatus: Sound.status.STOPPED,
            elapsed: '00:00',
            total: '00:00',
            position: 0,
            playFromPosition: 0,
            autoCompleteValue: '',
            tracks: [],
            track: {
                stream_url: '',
                title: '',
                artwork_url: ''
            }
        };
    }

    componentDidMount() {
        this.randomTrack();
    }

    render() {
        const scotchStyle = {
            width: '500px',
            height: '500px',
            backgroundImage: `linear-gradient(
                rgba(0, 0, 0, 0.7),
                rgba(0, 0, 0, 0.7)
            ), url(${this.xlArtwork(this.state.track.artwork_url)})`
        };
        return (
            <div className="scotch-music" style={scotchStyle}>
                <Search
                    autoCompleteValue={this.state.autoCompleteValue}
                    tracks={this.state.tracks}
                    handleSelect={this.handleSelect.bind(this)}
                    handleChange={this.handleChange.bind(this)}/>
                <Details
                    title={this.state.track.title}/>
                <Player
                    togglePlay={this.togglePlay.bind(this)}
                    stop={this.stop.bind(this)}
                    playStatus={this.state.playStatus}
                    forward={this.forward.bind(this)}
                    backward={this.backward.bind(this)}
                    random={this.randomTrack.bind(this)}/>
                <Sound
                    url={this.prepareUrl(this.state.track.stream_url)}
                    playStatus={this.state.playStatus}
                    onPlaying={this.handleSongPlaying.bind(this)}
                    playFromPosition={this.state.playFromPosition}
                    onFinishedPlaying={this.handleSongFinished.bind(this)}/>
                <Progress
                    elapsed={this.state.elapsed}
                    position={this.state.position}
                    total={this.state.total}/>
            </div>
        );
    }

    randomTrack() {
        Axios.get(`https://api.soundcloud.com/playlists/209262931?client_id=${this.client_id}`)
            .then(response => {
                const trackLength = response.data.tracks.length;
                const randomNumber = Math.floor((Math.random() * trackLength) + 1);

                this.setState({
                    track: response.data.tracks[randomNumber]
                });
            }).catch(console.log);
    }

    prepareUrl(url) {
        return `${url}?client_id=${this.client_id}`;
    }

    handleSongPlaying(audio) {
        this.setState({
            elapsed: this.formatMilliseconds(audio.position),
            total: this.formatMilliseconds(audio.duration),
            position: audio.position / audio.duration
        });
    }

    formatMilliseconds(milliseconds) {
        let hours = Math.floor(milliseconds / 3600000);
        milliseconds = milliseconds % 3600000;

        let minutes = Math.floor(milliseconds / 60000);
        milliseconds = milliseconds % 60000;

        let seconds = Math.floor(milliseconds / 1000);
        milliseconds = milliseconds % 1000;

        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    handleSongFinished() {
        this.randomTrack();
    }

    handleSelect(value, item) {
        this.setState({
            autoCompleteValue: value,
            track: item
        });
    }

    handleChange(event, value) {
        this.setState({
            autoCompleteValue: event.target.value
        });

        Axios.get(`https://api.soundcloud.com/tracks?client_id=${this.client_id}&q=${value}`)
            .then(response => {
                this.setState({
                    tracks: response.data
                });
            }).catch(console.log);
    }

    togglePlay() {
        this.setState({
            playStatus: this.state.playStatus === Sound.status.PLAYING ? Sound.status.PAUSED : Sound.status.PLAYING
        });
    }

    stop() {
        this.setState({
            playStatus: Sound.status.STOPPED
        });
    }

    forward() {
        this.setState({
            playFromPosition: this.state.playFromPosition += 1000*10
        });
    }

    backward() {
        this.setState({
            playFromPosition: this.state.playFromPosition -= 1000*10
        });
    }

    xlArtwork(url) {
        return url.replace(/large/, 't500x500');
    }
}

export default AppContainer;

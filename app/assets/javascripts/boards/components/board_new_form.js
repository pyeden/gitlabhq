/* global Vue */
/* global BoardService */
const boardMilestoneSelect = require('./milestone_select');
const extraMilestones = require('../mixins/extra_milestones');

(() => {
  window.gl = window.gl || {};
  window.gl.issueBoards = window.gl.issueBoards || {};

  const Store = gl.issueBoards.BoardsStore;

  gl.issueBoards.BoardSelectorForm = Vue.extend({
    props: {
      milestonePath: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        board: {
          id: false,
          name: '',
          milestone: extraMilestones[0],
          milestone_id: extraMilestones[0].id,
        },
        currentBoard: Store.state.currentBoard,
        currentPage: Store.state.currentPage,
        milestones: [],
        milestoneDropdownOpen: false,
        extraMilestones,
      };
    },
    components: {
      boardMilestoneSelect,
    },
    mounted() {
      if (this.currentBoard && Object.keys(this.currentBoard).length && this.currentPage !== 'new') {
        this.board = Vue.util.extend({}, this.currentBoard);
      }
    },
    computed: {
      buttonText() {
        if (this.currentPage === 'new') {
          return 'Create';
        }

        return 'Save';
      },
      milestoneToggleText() {
        return this.board.milestone.title || 'Milestone';
      },
      submitDisabled() {
        if (this.currentPage !== 'milestone') {
          return this.board.name === '';
        }

        return false;
      },
    },
    methods: {
      loadMilestones(e) {
        this.milestoneDropdownOpen = !this.milestoneDropdownOpen;
        BoardService.loadMilestones.call(this);

        if (this.milestoneDropdownOpen) {
          this.$nextTick(() => {
            const milestoneDropdown = this.$refs.milestoneDropdown;
            const rect = e.target.getBoundingClientRect();

            milestoneDropdown.style.left = `${rect.left}px`;
            milestoneDropdown.style.top = `${rect.bottom}px`;
            milestoneDropdown.style.width = `${rect.width}px`;
          });
        }
      },
      submit() {
        gl.boardService.createBoard(this.board)
          .then(() => {
            if (this.currentBoard && this.currentPage !== 'new') {
              // We reload the page to make sure the store & state of the app are correct
              location.reload();
            }

            // Enable the button thanks to our jQuery disabling it
            $(this.$refs.submitBtn).enable();

            // Reset the selectors current page
            Store.state.currentPage = '';
            Store.state.reload = true;
          });
      },
      cancel() {
        Store.state.currentPage = '';
      },
      selectMilestone(milestone) {
        this.milestoneDropdownOpen = false;
        this.board.milestone_id = milestone.id;
        this.board.milestone = {
          title: milestone.title,
        };
      },
    },
  });
})();

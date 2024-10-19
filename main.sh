# TODO
# bootstrap script

total_start=`date +%s.%N`

# eg: get_runtime start end label
# $1: start
# $2: end
get_runtime() {
  echo "$3 runtime: $( echo "$2 - $1" | bc -l )"
}

# eg: err "bad argument!"
# $1: message
err() {
  red='\033[0;31m'
  no_color='\033[0m'
  echo -e "${red}Unknown option $1${no_color}"
}

script_dir="$(dirname "$0")"
change_dir=""
forwards_flag=0
backwards_flag=0
clear_flag=0
debug_flag=0

for arg in "$@"
do
  case "$arg" in 
    --forwards)
      forwards_flag=1
      shift
      ;;
    --backwards)
      backwards_flag=1
      shift
      ;;
    --clear)
      clear_flag=1
      shift
      ;;
    --debug)
      debug_flag=1
      shift
      ;;
    --change_dir=*)
      change_dir=$(echo "$arg" | cut -d'=' -f2)
      shift
      ;;
    --*)
      err "unknown option $arg"
      return
      ;;
    *)
      ;;
  esac
done

if [[ "$change_dir" == "" ]]
then 
  change_dir_flag=0
else 
  change_dir_flag=1
fi

sum=$((forwards_flag + backwards_flag + clear_flag + change_dir_flag))
if [[ "$sum" != 1 ]] 
then 
  err "only one of --forwards, --backwards, --clear, --change_dir is supported!"
  return
fi

if [[ "$debug_flag" == "--debug" ]]
then 
  # clean logs at the beginning of the script so can view the logs after running the script
  deno task --cwd="$script_dir" cleanup
fi

if [[ "$forwards_flag" == 1 ]]
then 

  before_nav_pwd=$(pwd)
  # run deno command directly to avoid the output from `deno task` i.e. Task push_stack ...
  forwards_cmd="deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$script_dir/scripts/forwards.ts" --before_nav_pwd="$before_nav_pwd""
  [[ "$debug_flag" == 1 ]] && forwards_cmd+=" --debug"
  forwards_out=$(eval "$forwards_cmd")

  if [[ "$forwards_out" == "__err" ]]
  then
    err "Can't move forwards!"
    return
  else
    cd "$forwards_out"
  fi

elif [[ "$backwards_flag" == 1 ]]
then

  before_nav_pwd=$(pwd)
  if cd ".."
    after_nav_pwd=$(pwd)

    backwards_cmd="deno task --cwd="$script_dir" backwards --after_nav_pwd="$after_nav_pwd" --before_nav_pwd="$before_nav_pwd""
    [[ "$debug_flag" == 1 ]] && backwards_cmd+=" --debug"
    [[ "$debug_flag" == 0 ]] && backwards_cmd="($backwards_cmd > /dev/null 2>&1 &)"
    eval "$backwards_cmd"
  then
  fi

elif [[ "$clear_flag" == 1 ]]
then

  clear_cmd="deno task --cwd="$script_dir" clear_kv"
  [[ "$debug_flag" == 1 ]] && clear_cmd+=" --debug"
  [[ "$debug_flag" == 0 ]] && clear_cmd="($clear_cmd > /dev/null 2>&1 &)"
  eval "$clear_cmd"

elif [[ "$change_dir_flag" == 1 ]]
then

  before_nav_pwd=$(pwd)
  if z "$change_dir"
  then 
    after_nav_pwd=$(pwd)

    change_dir_cmd="deno task --cwd="$script_dir" push_stack --before_nav_pwd="$before_nav_pwd" --after_nav_pwd="$after_nav_pwd""
    [[ "$debug_flag" == 1 ]] && change_dir_cmd+=" --debug"
    [[ "$debug_flag" == 0 ]] && change_dir_cmd="($change_dir_cmd > /dev/null 2>&1 &)"
    eval "$change_dir_cmd"
  fi

fi

total_end=`date +%s.%N`
if [[ "$debug_flag" == 1 ]]
then 
  get_runtime "$total_start" "$total_end" "Total"
fi
